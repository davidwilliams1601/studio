import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "linkstream-ystti",
  appId: "1:748864193227:web:d9235f33570ecbfb56514e",
  storageBucket: "linkstream-ystti.firebasestorage.app",
  apiKey: "AIzaSyArrUkpwPbwJm3L9SvrhsaN_tRrbhby9h0",
  authDomain: "linkstream-ystti.firebaseapp.com",
  messagingSenderId: "748864193227"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, storage };
