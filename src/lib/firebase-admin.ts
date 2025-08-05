'use server';

import * as admin from 'firebase-admin';

let app: admin.app.App;

if (!admin.apps.length) {
  app = admin.initializeApp({
    storageBucket: 'linkstream-ystti.appspot.com',
  });
} else {
  app = admin.app();
}

export const auth = admin.auth(app);
export const db = admin.firestore(app);
export const storage = admin.storage(app);

export { app };
