
'use server';

import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    storageBucket: 'linkstream-ystti.appspot.com',
  });
}

export const app = admin.app();
export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();
