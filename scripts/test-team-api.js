// Test the team API endpoint
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

async function testTeamAPI() {
  try {
    // Initialize Firebase Admin
    if (!admin.apps.length) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    const db = admin.firestore();
    db.settings({ databaseId: process.env.FIRESTORE_DATABASE_ID || 'linkstream' });

    const userId = 'MUuxMbAE5sd75eX3aFeUsQPigtF3';

    console.log('\n🧪 Testing Team API Logic\n');

    // Get user
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    console.log('1️⃣ User Data:');
    console.log('  teamId:', userData.teamId);

    if (!userData.teamId) {
      console.log('❌ User has no teamId - API will return no team');
      process.exit(1);
    }

    // Get team
    const teamDoc = await db.collection('teams').doc(userData.teamId).get();

    if (!teamDoc.exists) {
      console.log('❌ Team document does not exist');
      process.exit(1);
    }

    const teamData = teamDoc.data();
    console.log('\n2️⃣ Team Data:');
    console.log('  id:', teamDoc.id);
    console.log('  ownerId:', teamData.ownerId);
    console.log('  maxSeats:', teamData.maxSeats);
    console.log('  memberIds:', teamData.memberIds);
    console.log('  invites:', teamData.invites?.length || 0);

    // Get team members
    console.log('\n3️⃣ Fetching Member Details:');
    for (const memberId of teamData.memberIds) {
      const memberDoc = await db.collection('users').doc(memberId).get();
      const memberData = memberDoc.data();
      console.log(`  - ${memberData?.email} (${memberId === teamData.ownerId ? 'owner' : 'member'})`);
    }

    console.log('\n✅ Team API should work correctly!');
    console.log('\n💡 If team page shows nothing, user needs to:');
    console.log('   1. Logout and login again');
    console.log('   2. Or clear browser cache/session storage');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testTeamAPI();
