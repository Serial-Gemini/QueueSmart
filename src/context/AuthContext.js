import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendEmailVerification, sendPasswordResetEmail, signOut,
} from "firebase/auth";
import { doc, getDoc, writeBatch, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const CVSU_EMAIL = /^[a-z0-9._%+-]+@cvsu\.edu\.ph$/i;
const STUDENT_NO = /^[A-Za-z0-9-]{4,20}$/;

const AUTH_MESSAGES = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-email": "That email address isn't valid.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "No internet connection. Please try again.",
  "auth/weak-password": "Password is too weak. Use at least 8 characters.",
};
export const friendlyError = (e) => AUTH_MESSAGES[e?.code] || e?.message || "Something went wrong.";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); // true while login/register is mid-flight

  useEffect(() => {
    if (!auth) { setLoading(false); return; } // preview mode
    let unsubProfile = () => {};
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      unsubProfile();
      setUser(u);
      if (!u) { setProfile(null); setLoading(false); return; }
      unsubProfile = onSnapshot(
        doc(db, "users", u.uid),
        (snap) => { setProfile(snap.exists() ? snap.data() : null); setLoading(false); },
        () => setLoading(false)
      );
    });
    return () => { unsubProfile(); unsubAuth(); };
  }, []);

  // The role that is allowed into the app right now (null = show login screens)
  const role =
    !busy && user && profile && (profile.role !== "student" || user.emailVerified)
      ? profile.role
      : null;

  const registerStudent = async ({ fullName, studentNumber, email, password }) => {
    email = email.trim().toLowerCase();
    studentNumber = studentNumber.trim();
    fullName = fullName.trim();
    if (!fullName) throw new Error("Full name is required.");
    if (!STUDENT_NO.test(studentNumber)) throw new Error("Enter a valid student number (letters, numbers, dashes).");
    if (!CVSU_EMAIL.test(email)) throw new Error("Use your @cvsu.edu.ph institutional email.");
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");

    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      try {
        // One atomic batch. The studentNumbers doc is a uniqueness lock: rules only allow
        // *creating* it, so if the number is taken the whole batch is rejected.
        const batch = writeBatch(db);
        batch.set(doc(db, "studentNumbers", studentNumber), { uid: cred.user.uid });
        batch.set(doc(db, "users", cred.user.uid), { role: "student", fullName, studentNumber, email });
        await batch.commit();
      } catch (e) {
        await cred.user.delete(); // roll back the auth account
        if (e.code === "permission-denied") {
          console.warn("Profile write denied:", e.message);
          throw new Error("That student number is already registered.");
        }
        throw e;
      }
      await sendEmailVerification(cred.user);
      await signOut(auth); // must verify before first login
    } finally {
      setBusy(false);
    }
  };

  const login = async (email, password, expectedRole) => {
    setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const actual = snap.exists() ? snap.data().role : null;
      if (!actual) {
        await signOut(auth);
        throw new Error("No profile found for this account. Contact the system administrator.");
      }
      if (actual !== expectedRole) {
        await signOut(auth);
        throw new Error(`This is a ${actual} account. Switch to the ${actual === "admin" ? "Office Admin" : "Student"} tab to sign in.`);
      }
      if (actual === "student" && !cred.user.emailVerified) {
        await sendEmailVerification(cred.user).catch(() => {});
        await signOut(auth);
        throw new Error("Please verify your email first. We just re-sent the verification link.");
      }
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email.trim().toLowerCase());
  const logout = () => (auth ? signOut(auth) : Promise.resolve());

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, registerStudent, login, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}