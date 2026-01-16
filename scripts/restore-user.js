const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
db.settings({ databaseId: 'linkstream' });

async function restoreUser() {
  const userId = 'WTKXHl6WZOf2THBM9mIYdK25icg2';
  const email = 'al@rebelcopy.com';

  console.log(`🔄 Restoring user: ${email}\n`);

  try {
    // Get user from Firebase Auth
    const userRecord = await admin.auth().getUser(userId);

    console.log('📋 Firebase Auth data:');
    console.log(`   User ID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   Display Name: ${userRecord.displayName || 'Not set'}`);
    console.log(`   Created: ${new Date(userRecord.metadata.creationTime)}`);

    // Check if Firestore doc already exists
    const userDoc = await db.collection('users').doc(userId).get();

    if (userDoc.exists) {
      console.log('\n⚠️  User document already exists in Firestore');
      console.log('Current data:', userDoc.data());
      return;
    }

    // Create Firestore document
    const displayName = userRecord.displayName || userRecord.email.split('@')[0];
    const createdAt = new Date(userRecord.metadata.creationTime);

    const userData = {
      email: userRecord.email,
      displayName: displayName,
      tier: 'free',
      createdAt: createdAt,
      updatedAt: new Date(),
    };

    console.log('\n📝 Creating Firestore document with data:');
    console.log(userData);

    await db.collection('users').doc(userId).set(userData);

    console.log('\n✅ Successfully restored user document!');

    // Verify
    const verifyDoc = await db.collection('users').doc(userId).get();
    if (verifyDoc.exists) {
      console.log('\n✓ Verified - User document now exists:');
      console.log(verifyDoc.data());
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

restoreUser().then(() => process.exit(0)).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
