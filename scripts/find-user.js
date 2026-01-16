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

async function findUser() {
  const searchEmail = 'al@rebelcopy.com';

  console.log(`🔍 Searching for user: ${searchEmail}\n`);

  try {
    // Search in Firebase Auth
    console.log('📋 Checking Firebase Auth...');
    try {
      const userRecord = await admin.auth().getUserByEmail(searchEmail);
      console.log('✅ Found in Firebase Auth:');
      console.log(`   User ID: ${userRecord.uid}`);
      console.log(`   Email: ${userRecord.email}`);
      console.log(`   Display Name: ${userRecord.displayName || 'Not set'}`);
      console.log(`   Created: ${new Date(userRecord.metadata.creationTime).toISOString()}`);
      console.log(`   Last Sign In: ${userRecord.metadata.lastSignInTime ? new Date(userRecord.metadata.lastSignInTime).toISOString() : 'Never'}`);
      console.log(`   Providers: ${userRecord.providerData.map(p => p.providerId).join(', ')}`);
      console.log(`   Disabled: ${userRecord.disabled}`);

      // Now check Firestore
      console.log('\n📋 Checking Firestore...');
      const userDoc = await db.collection('users').doc(userRecord.uid).get();

      if (userDoc.exists) {
        const data = userDoc.data();
        console.log('✅ Found in Firestore:');
        console.log(`   Email: ${data.email || 'MISSING'}`);
        console.log(`   Display Name: ${data.displayName || 'MISSING'}`);
        console.log(`   Tier: ${data.tier || 'free'}`);
        console.log(`   Team ID: ${data.teamId || 'None'}`);
        console.log(`   Created: ${data.createdAt?.toDate?.() || 'unknown'}`);
        console.log(`   Updated: ${data.updatedAt?.toDate?.() || 'unknown'}`);
      } else {
        console.log('❌ NOT found in Firestore');
        console.log('   User exists in Firebase Auth but has no Firestore document');
        console.log('   This may happen if signup process was interrupted');
      }

    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        console.log('❌ NOT found in Firebase Auth');

        // Still check Firestore by email
        console.log('\n📋 Checking Firestore by email query...');
        const snapshot = await db.collection('users').where('email', '==', searchEmail).get();

        if (snapshot.empty) {
          console.log('❌ NOT found in Firestore either');
          console.log('\n⚠️  This user does not exist in the system');
        } else {
          console.log('✅ Found in Firestore:');
          snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`   User ID: ${doc.id}`);
            console.log(`   Email: ${data.email}`);
            console.log(`   Display Name: ${data.displayName || 'MISSING'}`);
            console.log(`   Tier: ${data.tier || 'free'}`);
            console.log(`   Note: User exists in Firestore but NOT in Firebase Auth (orphaned record)`);
          });
        }
      } else {
        throw authError;
      }
    }

    // Also list all users to see what we have
    console.log('\n\n📋 All users in Firestore:');
    const allUsers = await db.collection('users').get();
    console.log(`Total users: ${allUsers.size}\n`);

    allUsers.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.email || 'NO EMAIL'} (${data.displayName || 'NO NAME'}) - ${data.tier || 'free'} - ID: ${doc.id}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findUser().then(() => process.exit(0)).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
