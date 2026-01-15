import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// Log environment variables for debugging
if (typeof window !== 'undefined') {
  console.log('Firebase env check:', {
    hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Validate that all required config values are present
function validateFirebaseConfig() {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  for (const key of required) {
    if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
      console.error(`Missing Firebase config: ${key}`);
      return false;
    }
  }
  return true;
}

// Global variables to store Firebase instances
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

// Initialize Firebase only on client-side and only once
function initializeFirebase() {
  if (typeof window === 'undefined') {
    // Don't initialize on server-side
    return { app: null, auth: null };
  }

  try {
    // Validate config first
    if (!validateFirebaseConfig()) {
      console.error('Firebase config validation failed');
      return { app: null, auth: null };
    }

    // Check if already initialized
    if (firebaseApp && firebaseAuth) {
      return { app: firebaseApp, auth: firebaseAuth };
    }

    // Initialize or get existing app
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    } else {
      firebaseApp = getApp();
    }

    firebaseAuth = getAuth(firebaseApp);

    return { app: firebaseApp, auth: firebaseAuth };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { app: null, auth: null };
  }
}

// Getter functions to lazy-initialize on client side
export function getAuthInstance(): Auth | null {
  if (typeof window === 'undefined') return null;

  if (!firebaseAuth) {
    const { auth } = initializeFirebase();
    return auth;
  }
  return firebaseAuth;
}

// Legacy export for backward compatibility - will be null on server
export const auth = typeof window !== 'undefined' ? getAuthInstance() : null;
export default typeof window !== 'undefined' ? firebaseApp : null;
