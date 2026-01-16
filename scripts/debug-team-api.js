// Debug what the team API would return for your user
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

async function debugTeamAPI() {
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

    console.log('\n🔍 Simulating /api/team endpoint for user:', userId, '\n');

    // Step 1: Get user
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('1️⃣ User document:');
    console.log('   teamId:', userData.teamId);
    console.log('   tier:', userData.tier);
    console.log('');

    // Step 2: Check if user has teamId
    if (!userData.teamId) {
      console.log('❌ User has NO teamId field!');
      console.log('   API will return: { success: true, team: null, isOwner: false }');
      console.log('');
      console.log('🔧 This is the problem! Need to re-link team to user.');
      process.exit(1);
    }

    // Step 3: Get team
    console.log('2️⃣ Fetching team:', userData.teamId);
    const teamDoc = await db.collection('teams').doc(userData.teamId).get();

    if (!teamDoc.exists) {
      console.log('❌ Team document not found!');
      process.exit(1);
    }

    const teamData = teamDoc.data();
    console.log('   ✅ Team exists');
    console.log('   ownerId:', teamData.ownerId);
    console.log('   maxSeats:', teamData.maxSeats);
    console.log('   memberIds:', teamData.memberIds);
    console.log('');

    // Step 4: Get members
    console.log('3️⃣ Fetching member details:');
    const memberPromises = teamData.memberIds.map(async (memberId) => {
      const memberDoc = await db.collection('users').doc(memberId).get();
      const memberData = memberDoc.data();
      return {
        uid: memberId,
        email: memberData?.email,
        displayName: memberData?.displayName,
        role: memberId === teamData.ownerId ? 'owner' : 'member',
        joinedAt: memberData?.teamJoinedAt || teamData.createdAt,
      };
    });

    const members = await Promise.all(memberPromises);
    console.log('   Members:', JSON.stringify(members, null, 2));
    console.log('');

    // Step 5: Build response
    const response = {
      success: true,
      team: {
        id: teamDoc.id,
        ...teamData,
        members,
      },
      isOwner: teamData.ownerId === userId,
    };

    console.log('4️⃣ API Response:');
    console.log(JSON.stringify(response, null, 2));
    console.log('');
    console.log('✅ API should return this data!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugTeamAPI();
