import admin from "firebase-admin";

let app: admin.app.App | null = null;

function getApp() {
  if (!app) {
    if (!admin.apps.length) {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      if (!serviceAccount) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is required');
      }
      
      app = admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
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
