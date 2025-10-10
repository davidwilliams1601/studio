import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

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
    // Check if already initialized
    if (firebaseApp && firebaseAuth) {
      return { app: firebaseApp, auth: firebaseAuth };
    }

    // Initialize or get existing app
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
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

// Export the initialized instances
const { app, auth } = initializeFirebase();

export { auth };
export default app;
