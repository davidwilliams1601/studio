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

async function checkUsers() {
  // Get all users from Firestore
  const usersSnapshot = await db.collection('users').get();
  
  console.log(`Total users: ${usersSnapshot.size}\n`);
  
  const incompleteUsers = [];
  
  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    const hasEmail = !!data.email;
    const hasDisplayName = !!data.displayName;
    
    if (!hasEmail || !hasDisplayName) {
      incompleteUsers.push({
        uid: doc.id,
        email: data.email || 'MISSING',
        displayName: data.displayName || 'MISSING',
        tier: data.tier || 'free',
        createdAt: data.createdAt?.toDate?.() || 'unknown'
      });
    }
  }
  
  if (incompleteUsers.length > 0) {
    console.log('❌ Users with missing data:\n');
    incompleteUsers.forEach(user => {
      console.log(`User ID: ${user.uid}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Display Name: ${user.displayName}`);
      console.log(`  Tier: ${user.tier}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log('');
    });
  } else {
    console.log('✅ All users have complete data');
  }
}

checkUsers().then(() => process.exit(0)).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
