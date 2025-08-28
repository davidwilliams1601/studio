import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
 apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
 authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
 projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
 storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
 messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
 appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
 try {
   if (!getApps().length) {
     app = initializeApp(firebaseConfig);
   } else {
     app = getApps()[0];
   }
   
   db = getFirestore(app, 'linkstream');
   auth = getAuth(app);
   
   if (db) {
     enableNetwork(db).catch((error) => {
       console.log('Firebase network already enabled or error:', error);
     });
   }
 } catch (error) {
   console.error('Firebase initialization error:', error);
 }
}

export { db, auth };
