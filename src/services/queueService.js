import {
  doc, collection, runTransaction, writeBatch, query, where, orderBy, limit,
  getDocs, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export const formatNumber = (prefix, n) => `${prefix}-${String(n).padStart(3, "0")}`;

// QR payload: queuesmart://join?o=<officeId>&t=<token>   (no queue number inside)
export function parseQr(data) {
  try {
    const m = /^queuesmart:\/\/join\?o=([^&]+)&t=([A-Za-z0-9_-]+)$/.exec(data);
    return m ? { officeId: decodeURIComponent(m[1]), token: m[2] } : null;
  } catch { return null; }
}
export const buildQr = (officeId, token) =>
  `queuesmart://join?o=${encodeURIComponent(officeId)}&t=${token}`;

const randomToken = () =>
  Array.from({ length: 24 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");

/* ---------- STUDENT ---------- */
export async function joinQueue({ officeId, token, uid, profile }) {
  const officeRef = doc(db, "offices", officeId);
  const lockRef = doc(db, "activeTickets", `${officeId}_${uid}`);
  const ticketRef = doc(collection(db, "offices", officeId, "tickets"));

  return runTransaction(db, async (tx) => {
    const officeSnap = await tx.get(officeRef);
    if (!officeSnap.exists()) throw new Error("This office does not exist.");
    const office = officeSnap.data();
    if (!office.qrActive || office.qrToken !== token) throw new Error("This QR code is expired or inactive.");
    if (office.paused) throw new Error("This office has paused its queue. Try again later.");
    if (office.status === "Closed") throw new Error("This office is currently closed.");
    if ((await tx.get(lockRef)).exists()) throw new Error("You already have an active queue number here.");

    const n = (office.lastNumber || 0) + 1;
    const number = formatNumber(office.prefix, n);
    tx.update(officeRef, { lastNumber: n });
    tx.set(ticketRef, {
      uid, officeId, officeName: office.name, number, n,
      studentName: profile.fullName, studentNumber: profile.studentNumber,
      status: "waiting", createdAt: serverTimestamp(),
    });
    tx.set(lockRef, { uid, officeId, ticketId: ticketRef.id });
    return { ticketId: ticketRef.id, number };
  });
}

export async function cancelOwnTicket({ officeId, ticketId, uid }) {
  const b = writeBatch(db);
  b.update(doc(db, "offices", officeId, "tickets", ticketId), { status: "cancelled", endedAt: serverTimestamp() });
  b.delete(doc(db, "activeTickets", `${officeId}_${uid}`));
  await b.commit();
}

/* ---------- ADMIN ---------- */
export async function callNext(officeId) {
  const q = query(
    collection(db, "offices", officeId, "tickets"),
    where("status", "==", "waiting"), orderBy("n"), limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("No students are waiting.");
  const t = snap.docs[0];
  const b = writeBatch(db);
  b.update(t.ref, { status: "serving", calledAt: serverTimestamp() });
  b.update(doc(db, "offices", officeId), { servingN: t.data().n, servingNumber: t.data().number });
  await b.commit();
}

// action: "completed" | "cancelled" | "skipped" — all release the student's lock
export async function closeTicket({ officeId, ticket, action }) {
  const b = writeBatch(db);
  b.update(doc(db, "offices", officeId, "tickets", ticket.id), { status: action, endedAt: serverTimestamp() });
  b.delete(doc(db, "activeTickets", `${officeId}_${ticket.uid}`));
  await b.commit();
}

export const setPaused = (officeId, paused) =>
  writeBatch(db).update(doc(db, "offices", officeId), { paused }).commit();

export const setQrActive = (officeId, active) =>
  writeBatch(db).update(doc(db, "offices", officeId), { qrActive: active }).commit();

export const regenerateQr = (officeId) =>
  writeBatch(db).update(doc(db, "offices", officeId), { qrToken: randomToken(), qrActive: true }).commit();

export async function resetDailyQueue(officeId) {
  const snap = await getDocs(query(
    collection(db, "offices", officeId, "tickets"),
    where("status", "in", ["waiting", "serving"])
  ));
  const b = writeBatch(db); // fine up to 500 ops; chunk if a day ever exceeds that
  snap.docs.forEach((d) => {
    b.update(d.ref, { status: "cancelled", endedAt: serverTimestamp() });
    b.delete(doc(db, "activeTickets", `${officeId}_${d.data().uid}`));
  });
  b.update(doc(db, "offices", officeId), { lastNumber: 0, servingN: 0, servingNumber: null });
  await b.commit();
}