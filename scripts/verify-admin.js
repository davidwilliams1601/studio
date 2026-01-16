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

async function verifyAdmin() {
  const userId = 'MUuxMbAE5sd75eX3aFeUsQPigtF3';
  const email = 'davidwilliams1601@gmail.com';

  try {
    // Get user record from Firebase Auth
    const userRecord = await admin.auth().getUser(userId);

    console.log('📋 User Record:');
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   User ID: ${userRecord.uid}`);
    console.log(`   Custom Claims:`, userRecord.customClaims);

    if (userRecord.customClaims?.admin) {
      console.log('\n✅ Admin claim is SET');
      console.log('\n⚠️  If you still get "Access denied", you need to:');
      console.log('   1. Completely log out of the application');
      console.log('   2. Close all browser tabs for lstream.app');
      console.log('   3. Clear browser cache (optional but recommended)');
      console.log('   4. Log back in');
      console.log('\nThis forces Firebase to issue a new ID token with the admin claim.');
    } else {
      console.log('\n❌ Admin claim is NOT set');
      console.log('Setting admin claim now...');

      await admin.auth().setCustomUserClaims(userId, { admin: true });
      console.log('✅ Admin claim has been set');
      console.log('\nPlease follow these steps:');
      console.log('   1. Completely log out of the application');
      console.log('   2. Close all browser tabs for lstream.app');
      console.log('   3. Log back in to get a fresh token with admin privileges');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyAdmin().then(() => process.exit(0)).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
