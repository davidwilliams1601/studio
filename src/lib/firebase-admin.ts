'use server';

import * as admin from 'firebase-admin';

let app: admin.app.App;

if (!admin.apps.length) {
  try {
    // When deployed to App Hosting, the SDK will automatically discover the
    // service account credentials.
    app = admin.initializeApp({
      storageBucket: 'linkstream-ystti.appspot.com',
    });
  } catch (error: any) {
     console.error('Failed to initialize Firebase Admin:', error.message);
     // We will throw here to make it clear that initialization failed.
     throw new Error('Firebase Admin SDK initialization failed. Check your service account credentials.');
  }
} else {
  app = admin.app();
}

export const auth = admin.auth(app);
export const db = admin.firestore(app);
export const storage = admin.storage(app);

export { app };
