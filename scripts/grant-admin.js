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

async function grantAdmin() {
  const userId = 'MUuxMbAE5sd75eX3aFeUsQPigtF3'; // davidwilliams1601@gmail.com
  const email = 'davidwilliams1601@gmail.com';
  
  try {
    // Set admin custom claim
    await admin.auth().setCustomUserClaims(userId, { admin: true });
    console.log('✅ Admin privileges granted to:', email);
    console.log('✅ User ID:', userId);
    console.log('');
    console.log('Please log out and log back in for the changes to take effect.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

grantAdmin().then(() => process.exit(0)).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
