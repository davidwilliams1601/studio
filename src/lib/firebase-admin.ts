'use server';

import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

function initializeFirebase() {
  if (app) return app;
  
  if (!admin.apps.length) {
    try {
      app = admin.initializeApp({
        storageBucket: 'linkstream-ystti.appspot.com',
      });
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error: any) {
      console.error('Firebase Admin initialization error:', error.message);
      throw error;
    }
  } else {
    app = admin.app();
  }
  
  return app;
}

// Lazy getters for Firebase services
export async function getAuth() {
  const firebaseApp = initializeFirebase();
  return admin.auth(firebaseApp);
}

export async function getDb() {
  const firebaseApp = initializeFirebase();
  return admin.firestore(firebaseApp);
}

export async function getStorage() {
  const firebaseApp = initializeFirebase();
  return admin.storage(firebaseApp);
}
