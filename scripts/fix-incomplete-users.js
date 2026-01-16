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

async function fixIncompleteUsers() {
  const incompleteUserIds = [
    '06u6HVvSeiVbVeNIxzFw2d53ZH53',
    'qaZeHK5U6OZMJqYXGW0C472CFoE3'
  ];

  console.log('🔍 Checking Firebase Auth for user data...\n');

  for (const userId of incompleteUserIds) {
    try {
      // Get user data from Firebase Auth
      const userRecord = await admin.auth().getUser(userId);

      console.log(`\n📝 User ID: ${userId}`);
      console.log(`   Auth Email: ${userRecord.email || 'MISSING IN AUTH'}`);
      console.log(`   Auth Display Name: ${userRecord.displayName || 'MISSING IN AUTH'}`);
      console.log(`   Auth Provider: ${userRecord.providerData.map(p => p.providerId).join(', ')}`);

      // Get current Firestore data
      const userDoc = await db.collection('users').doc(userId).get();
      const currentData = userDoc.data();

      console.log(`   Firestore Email: ${currentData?.email || 'MISSING'}`);
      console.log(`   Firestore Display Name: ${currentData?.displayName || 'MISSING'}`);

      // Prepare update data
      const updateData = {};

      if (!currentData?.email && userRecord.email) {
        updateData.email = userRecord.email;
      }

      if (!currentData?.displayName && userRecord.displayName) {
        updateData.displayName = userRecord.displayName;
      }

      // If display name is still missing, try to derive from email
      if (!updateData.displayName && !currentData?.displayName && userRecord.email) {
        updateData.displayName = userRecord.email.split('@')[0];
        console.log(`   ⚠️  No display name in Auth, deriving from email: ${updateData.displayName}`);
      }

      if (Object.keys(updateData).length > 0) {
        updateData.updatedAt = new Date();

        console.log(`   ✏️  Updating Firestore with:`, updateData);
        await db.collection('users').doc(userId).update(updateData);
        console.log(`   ✅ Successfully updated user ${userId}`);
      } else {
        console.log(`   ⚠️  No updates needed - data already complete or missing in Auth`);
      }

    } catch (error) {
      console.error(`\n❌ Error processing user ${userId}:`, error.message);

      // If user doesn't exist in Firebase Auth, we have a problem
      if (error.code === 'auth/user-not-found') {
        console.error(`   ⚠️  User ${userId} exists in Firestore but NOT in Firebase Auth`);
        console.error(`   This may be an orphaned record that should be investigated`);
      }
    }
  }

  console.log('\n\n🔍 Verifying updates...\n');

  // Re-check to verify
  for (const userId of incompleteUserIds) {
    const userDoc = await db.collection('users').doc(userId).get();
    const data = userDoc.data();

    console.log(`User ID: ${userId}`);
    console.log(`  Email: ${data?.email || 'STILL MISSING'}`);
    console.log(`  Display Name: ${data?.displayName || 'STILL MISSING'}`);
    console.log('');
  }

  console.log('✅ Fix complete!');
}

fixIncompleteUsers().then(() => process.exit(0)).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
