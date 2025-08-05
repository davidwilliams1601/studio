
'use server';

import * as admin from 'firebase-admin';

let app: admin.app.App;

if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      const serviceAccount = JSON.parse(serviceAccountKey);
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'linkstream-ystti.appspot.com',
      });
      console.log('✓ Firebase Admin initialized with service account key.');
    } else {
      // Fallback for environments where GOOGLE_APPLICATION_CREDENTIALS might be set
      // or for Firebase Hosting/Functions environments.
      app = admin.initializeApp({
        storageBucket: 'linkstream-ystti.appspot.com',
      });
      console.log('✓ Firebase Admin initialized with default credentials.');
    }
  } catch (error: any) {
     console.error('❌ Failed to initialize Firebase Admin:', error.message);
     // If initialization fails, subsequent calls will also fail,
     // but we prevent the app from crashing at the module level.
  }
} else {
  app = admin.app();
}


export const auth = app ? admin.auth(app) : undefined;
export const db = app ? admin.firestore(app) : undefined;
export const storage = app ? admin.storage(app) : undefined;

export { app };
