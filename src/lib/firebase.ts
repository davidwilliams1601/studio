import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArrUkpwPbwJm3L9SvrhsaN_tRrbhby9h0",
  authDomain: "linkstream-ystti.firebaseapp.com",
  projectId: "linkstream-ystti",
  storageBucket: "linkstream-ystti.firebasestorage.app",
  messagingSenderId: "748864193227",
  appId: "1:748864193227:web:d9235f33570ecbfb56514e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
