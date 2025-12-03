'use server';

import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

function initializeFirebase() {
  if (app) return app;

  if (!admin.apps.length) {
    try {
      // Try to get service account from JSON first (Vercel production)
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

        app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (serviceAccount.project_id + '.appspot.com'),
        });

        console.log('✅ Firebase Admin SDK initialized with service account JSON');
      }
      // Fall back to individual environment variables (local development)
      else {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (!projectId || !clientEmail || !privateKey) {
          throw new Error(
            'Missing Firebase Admin credentials. Please set FIREBASE_SERVICE_ACCOUNT_JSON or individual credentials.'
          );
        }

        app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
          storageBucket: projectId + '.appspot.com',
        });

        console.log('✅ Firebase Admin SDK initialized with individual credentials');
      }
    } catch (error: any) {
      console.error('❌ Firebase Admin initialization error:', error.message);
      throw error;
    }
  } else {
    app = admin.app();
  }

  return app;
}

// Lazy getters for Firebase services
export async function getAuth() {
  const firebaseApp = initializeFirebase();
  return admin.auth(firebaseApp);
}

export async function getDb() {
  const firebaseApp = initializeFirebase();
  return admin.firestore(firebaseApp);
}

export async function getStorage() {
  const firebaseApp = initializeFirebase();
  return admin.storage(firebaseApp);
}

/**
 * Create a custom Firebase token for a user
 * Used after LinkedIn OAuth to sign users into Firebase
 */
export async function createCustomToken(
  uid: string,
  additionalClaims?: object
): Promise<string> {
  try {
    const auth = await getAuth();
    return await auth.createCustomToken(uid, additionalClaims);
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw new Error('Failed to create authentication token');
  }
}

/**
 * Get or create a Firebase user
 */
export async function getOrCreateUser(
  linkedInUserId: string,
  email: string,
  displayName: string,
  photoUrl?: string
): Promise<admin.auth.UserRecord> {
  const uid = `linkedin:${linkedInUserId}`;
  const auth = await getAuth();

  try {
    // Try to get existing user
    return await auth.getUser(uid);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      // Create new user
      return await auth.createUser({
        uid,
        email,
        emailVerified: true, // LinkedIn emails are verified
        displayName,
        photoURL: photoUrl,
      });
    }
    throw error;
  }
}

/**
 * Update user profile information
 */
export async function updateUserProfile(
  uid: string,
  updates: {
    email?: string;
    displayName?: string;
    photoURL?: string;
  }
): Promise<admin.auth.UserRecord> {
  const auth = await getAuth();
  return await auth.updateUser(uid, updates);
}

/**
 * Verify an ID token
 */
export async function verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  const auth = await getAuth();
  return await auth.verifyIdToken(idToken);
}

/**
 * Delete a user and all their data (GDPR compliance)
 */
export async function deleteUserData(uid: string): Promise<void> {
  const auth = await getAuth();
  const db = await getDb();
  const storage = await getStorage();
  const batch = db.batch();

  try {
    // Delete user document
    batch.delete(db.collection('users').doc(uid));

    // Delete all backups
    const backupsSnapshot = await db
      .collection('backups')
      .where('uid', '==', uid)
      .get();

    backupsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete all backup snapshots
    const snapshotsSnapshot = await db
      .collection('backupSnapshots')
      .doc(uid)
      .collection('snapshots')
      .get();

    snapshotsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete org memberships
    const orgMembershipsSnapshot = await db
      .collection('orgMembers')
      .where('uid', '==', uid)
      .get();

    orgMembershipsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    // Delete Storage files
    const bucket = storage.bucket();
    await bucket.deleteFiles({
      prefix: `users/${uid}/`,
    });

    // Delete Firebase Auth user
    await auth.deleteUser(uid);

  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}
