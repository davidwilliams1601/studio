
'use server';

import * as admin from 'firebase-admin';

let app: admin.app.App;

if (!admin.apps.length) {
  try {
    // Check if we're running in Firebase App Hosting or locally
    const isFirebaseAppHosting = process.env.FIREBASE_CONFIG || process.env.K_SERVICE;
    
    if (isFirebaseAppHosting) {
      // Firebase App Hosting automatically provides credentials
      app = admin.initializeApp({
        storageBucket: 'linkstream-ystti.appspot.com',
      });
    } else {
      // Local development - use service account for testing
      // You can either:
      // 1. Use environment variables (create .env.local with your service account details)
      // 2. Use a service account JSON file
      
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        // Option 1: Environment variables
        app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
          storageBucket: 'linkstream-ystti.appspot.com',
        });
      } else {
        // Option 2: Service account JSON file (place serviceAccountKey.json in project root)
        try {
          app = admin.initializeApp({
            credential: admin.credential.cert('./serviceAccountKey.json'),
            storageBucket: 'linkstream-ystti.appspot.com',
          });
        } catch {
          throw new Error(
            'Local development requires Firebase credentials. Please either:\n' +
            '1. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local\n' +
            '2. Place serviceAccountKey.json in your project root\n' +
            '3. Deploy to Firebase App Hosting where credentials are automatically provided'
          );
        }
      }
    }
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error: any) {
    console.error('Failed to initialize Firebase Admin:', error.message);
    throw error;
  }
} else {
  // Get the existing app instance
  app = admin.app();
}

// Export the services
export const auth = admin.auth(app);
export const db = admin.firestore(app);
export const storage = admin.storage(app);
export { app };
