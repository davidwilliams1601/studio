const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkUserTier() {
  try {
    const email = 'davidwilliams1601@gmail.com';

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('Firebase Auth UID:', userRecord.uid);

    // Get Firestore document
    const userDoc = await db.collection('users').doc(userRecord.uid).get();

    if (!userDoc.exists) {
      console.log('❌ User document does not exist in Firestore');
      return;
    }

    const userData = userDoc.data();
    console.log('\n📊 User Data:');
    console.log('  - Tier:', userData.tier);
    console.log('  - Email:', userData.email);
    console.log('  - Display Name:', userData.displayName);
    console.log('  - Stripe Customer ID:', userData.stripeCustomerId);
    console.log('  - Backups This Month:', userData.backupsThisMonth);
    console.log('  - Created At:', userData.createdAt?.toDate());
    console.log('  - Upgrade Date:', userData.upgradeDate);

    console.log('\n🔍 Full Document:');
    console.log(JSON.stringify(userData, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkUserTier();
