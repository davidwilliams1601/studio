'use server';

import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

function initializeFirebase() {
  if (app) return app;

  if (!admin.apps.length) {
    try {
      // Get credentials from environment variables
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
          'Missing Firebase Admin credentials. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.'
        );
      }

      // Initialize with service account credentials
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
        }),
        storageBucket: 'linkstream-ystti.appspot.com',
      });

      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error: any) {
      console.error('❌ Firebase Admin initialization error:', error.message);
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
