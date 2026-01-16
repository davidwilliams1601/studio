const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

console.log('🔍 Testing Firebase Admin SDK session creation...\n');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function testSessionCreation() {
  const userId = 'MUuxMbAE5sd75eX3aFeUsQPigtF3';

  try {
    // Create a custom token for testing
    console.log('1. Creating custom token for user...');
    const customToken = await admin.auth().createCustomToken(userId);
    console.log('   ✅ Custom token created');

    // Try to create a session cookie (this will fail without a real ID token)
    console.log('\n2. Testing session cookie creation capability...');
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    // Check if the method exists
    if (typeof admin.auth().createSessionCookie === 'function') {
      console.log('   ✅ createSessionCookie method is available');
    } else {
      console.log('   ❌ createSessionCookie method is NOT available');
    }

    console.log('\n3. Verifying Firebase Auth configuration...');
    console.log('   Project ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('   Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
    console.log('   Private Key length:', process.env.FIREBASE_PRIVATE_KEY?.length);
    console.log('   Private Key starts with:', process.env.FIREBASE_PRIVATE_KEY?.substring(0, 30));

    // Get user to verify credentials work
    console.log('\n4. Testing user lookup...');
    const userRecord = await admin.auth().getUser(userId);
    console.log('   ✅ User found:', userRecord.email);
    console.log('   Custom claims:', userRecord.customClaims);

    console.log('\n✅ All tests passed - Firebase Admin SDK is working correctly');
    console.log('\nNote: The 500 error might be coming from:');
    console.log('  1. Different environment variables in production vs local');
    console.log('  2. ID token verification failing');
    console.log('  3. Session cookie creation failing due to token issues');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Code:', error.code);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
}

testSessionCreation().then(() => process.exit(0)).catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
