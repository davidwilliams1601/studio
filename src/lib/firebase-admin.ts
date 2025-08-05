
'use server';

import * as admin from 'firebase-admin';

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      const serviceAccount = JSON.parse(serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'linkstream-ystti.appspot.com',
      });
      console.log('✓ Firebase Admin initialized with service account key.');
    } else {
      // Fallback for environments where GOOGLE_APPLICATION_CREDENTIALS might be set
      // or for Firebase Hosting/Functions environments.
      admin.initializeApp({
        storageBucket: 'linkstream-ystti.appspot.com',
      });
      console.log('✓ Firebase Admin initialized with default credentials.');
    }
  } catch (error: any) {
     console.error('❌ Failed to initialize Firebase Admin:', error.message);
  }
}

export const app = admin.app();
export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();
