// lib/firebase-admin.ts (unified singleton)
import admin from "firebase-admin";

let app: admin.app.App | null = null;

function getApp() {
  if (!app) {
    if (!admin.apps.length) {
      app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else {
      app = admin.app();
    }
  }
  return app!;
}

export const getAuth = () => admin.auth(getApp());
export const getDb = () => admin.firestore(getApp());
export const getStorage = () => admin.storage(getApp());
