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

async function checkUserTiers() {
  const usersToCheck = [
    { email: 'al@rebelcopy.com', id: 'WTKXHl6WZOf2THBM9mIYdK25icg2' },
    { email: 'davidwilliams1601@gmail.com', id: 'MUuxMbAE5sd75eX3aFeUsQPigtF3' }
  ];

  console.log('🔍 Checking user tiers in Firestore...\n');

  for (const user of usersToCheck) {
    console.log(`\n📋 ${user.email}`);
    console.log(`   User ID: ${user.id}`);

    const userDoc = await db.collection('users').doc(user.id).get();

    if (!userDoc.exists) {
      console.log('   ❌ User document NOT found in Firestore');
      continue;
    }

    const data = userDoc.data();
    console.log(`   Email: ${data.email}`);
    console.log(`   Display Name: ${data.displayName}`);
    console.log(`   Tier: ${data.tier}`);
    console.log(`   Team ID: ${data.teamId || 'None'}`);
    console.log(`   Created: ${data.createdAt?.toDate?.() || 'unknown'}`);
    console.log(`   Updated: ${data.updatedAt?.toDate?.() || 'unknown'}`);

    // Check if they have a team
    if (data.teamId) {
      console.log(`\n   📋 Checking team ${data.teamId}...`);
      const teamDoc = await db.collection('teams').doc(data.teamId).get();
      if (teamDoc.exists) {
        const teamData = teamDoc.data();
        console.log(`   ✅ Team exists`);
        console.log(`      Owner: ${teamData.ownerEmail}`);
        console.log(`      Max Seats: ${teamData.maxSeats}`);
        console.log(`      Members: ${teamData.memberIds?.length || 0}`);
        console.log(`      Subscription ID: ${teamData.subscriptionId || 'None'}`);
      } else {
        console.log(`   ❌ Team document NOT found`);
      }
    }
  }

  // Also check all users to see the full picture
  console.log('\n\n📋 All users in Firestore:');
  const allUsers = await db.collection('users').get();

  const businessUsers = [];
  const proUsers = [];
  const freeUsers = [];

  allUsers.forEach(doc => {
    const data = doc.data();
    const userInfo = `${data.email || 'NO EMAIL'} (${data.displayName || 'NO NAME'}) - ID: ${doc.id}`;

    if (data.tier === 'business') {
      businessUsers.push(userInfo);
    } else if (data.tier === 'pro') {
      proUsers.push(userInfo);
    } else {
      freeUsers.push(userInfo);
    }
  });

  console.log(`\n🏢 Business tier (${businessUsers.length}):`);
  businessUsers.forEach(u => console.log(`   - ${u}`));

  console.log(`\n⭐ Pro tier (${proUsers.length}):`);
  proUsers.forEach(u => console.log(`   - ${u}`));

  console.log(`\n🆓 Free tier (${freeUsers.length}):`);
  freeUsers.forEach(u => console.log(`   - ${u}`));
}

checkUserTiers().then(() => process.exit(0)).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
