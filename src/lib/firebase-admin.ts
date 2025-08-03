
'use server';

import * as admin from 'firebase-admin';

console.log('Firebase Admin initialization started...');

// Check if we have the required environment variables
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL', 
  'FIREBASE_PRIVATE_KEY'
];

console.log('Checking environment variables...');
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Missing environment variable: ${envVar}`);
  } else {
    console.log(`✓ ${envVar} is set`);
  }
}

if (!admin.apps.length) {
  try {
    console.log('Initializing Firebase Admin...');
    
    // Initialize with service account if available
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || 'linkstream-ystti',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        storageBucket: 'linkstream-ystti.appspot.com',
      });
      console.log('✓ Firebase Admin initialized with service account');
    } else {
      // Fallback to default initialization (works in Firebase environment)
      admin.initializeApp({
        storageBucket: 'linkstream-ystti.appspot.com',
      });
      console.log('✓ Firebase Admin initialized with default credentials');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    throw error;
  }
} else {
  console.log('✓ Firebase Admin already initialized');
}

export const app = admin.app();
export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();

console.log('Firebase Admin exports created successfully');
