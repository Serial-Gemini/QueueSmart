import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyD2CO_9oegbl7LIstarsfFNUakrX1B-n7Y",
  authDomain: "queuesmart-b2f88.firebaseapp.com",
  projectId: "queuesmart-b2f88",
  storageBucket: "queuesmart-b2f88.firebasestorage.app",
  messagingSenderId: "157857958458",
  appId: "1:157857958458:web:77e2923edf6f880aba0303",
  measurementId: "G-TDVJ00W55E"
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {

  auth = getAuth(app);

}

export const db = getFirestore(app);
export { auth };
export default app;