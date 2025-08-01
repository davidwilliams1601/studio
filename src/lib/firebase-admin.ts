import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    storageBucket: 'linkstream-ystti.appspot.com',
  });
}

export const app = admin.app();
