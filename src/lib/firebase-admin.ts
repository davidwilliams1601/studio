
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
    } else {
      app = admin.initializeApp({
        storageBucket: 'linkstream-ystti.appspot.com',
      });
    }
  } catch (error: any) {
     console.error('Failed to initialize Firebase Admin:', error.message);
     // We will throw here to make it clear that initialization failed.
     throw new Error('Firebase Admin SDK initialization failed. Check your service account credentials.');
  }
} else {
  app = admin.app();
}

const auth = admin.auth();
const db = admin.firestore();
const storage = admin.storage();

export { app, auth, db, storage };
