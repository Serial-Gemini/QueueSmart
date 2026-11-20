import { Platform } from "react-native";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let app = null;
let auth = null;
if (isFirebaseConfigured) {
  const existing = getApps().length > 0;
  app = existing ? getApp() : initializeApp(firebaseConfig);
  if (existing || Platform.OS === "web") {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  }
}

export { auth };
export const db = app ? getFirestore(app) : null;