'use server';

import * as admin from 'firebase-admin';

let app: admin.app.App;

if (!admin.apps.length) {
  try {
    // Check if we're in a local development environment
    const isLocal = process.env.NODE_ENV === 'development' || !process.env.GOOGLE_CLOUD_PROJECT;
    
    let credential;
    
    if (isLocal) {
      // Local development: use service account credentials from environment variables
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error('Missing Firebase environment variables. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your .env.local file.');
      }
      
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
    } else {
      // Google Cloud deployment: use Application Default Credentials
      credential = admin.credential.applicationDefault();
    }

    app = admin.initializeApp({
      credential,
      storageBucket: 'linkstream-ystti.appspot.com',
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error: any) {
    console.error('Failed to initialize Firebase Admin:', error.message);
    console.error('Error details:', error);
    
    // Provide more specific error guidance
    if (error.message.includes('Missing Firebase environment variables')) {
      throw error; // Re-throw the specific environment variable error
    } else if (error.message.includes('Could not load the default credentials')) {
      throw new Error('Firebase Admin SDK initialization failed: Application Default Credentials not found. Make sure your Google Cloud service has the necessary permissions.');
    } else if (error.message.includes('credential')) {
      throw new Error('Firebase Admin SDK initialization failed: Invalid service account credentials. Please check your environment variables or Google Cloud setup.');
    } else {
      throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
    }
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