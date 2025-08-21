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

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { app: null, auth: null };
  }

  try {
    // Check if we have the required config
    if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
      console.log('🔄 Firebase config incomplete, using localStorage mode');
      return { app: null, auth: null };
    }

    if (firebaseApp && firebaseAuth) {
      return { app: firebaseApp, auth: firebaseAuth };
    }

    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApp();
    }

    firebaseAuth = getAuth(firebaseApp);
    console.log('✅ Firebase initialized successfully');

    return { app: firebaseApp, auth: firebaseAuth };
  } catch (error) {
    console.log('🔄 Firebase initialization failed, using localStorage mode');
    return { app: null, auth: null };
  }
}

const { app, auth } = initializeFirebase();

export { auth };
export default app;
