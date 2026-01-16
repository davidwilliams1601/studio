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

async function upgradeToBusinessTier() {
  const userId = 'WTKXHl6WZOf2THBM9mIYdK25icg2';
  const email = 'al@rebelcopy.com';

  console.log(`⬆️  Upgrading ${email} to Business tier...\n`);

  try {
    // Get current user data
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.error('❌ User document not found');
      return;
    }

    const userData = userDoc.data();
    console.log('📋 Current user data:');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Tier: ${userData.tier}`);
    console.log(`   Team ID: ${userData.teamId || 'None'}`);

    // Create a team for the user
    console.log('\n📝 Creating team...');
    const teamRef = await db.collection('teams').add({
      ownerId: userId,
      ownerEmail: email,
      subscriptionId: 'manual-upgrade', // No Stripe subscription
      maxSeats: 10,
      memberIds: [userId],
      invites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ Team created with ID: ${teamRef.id}`);

    // Update user to Business tier
    console.log('\n📝 Updating user tier...');
    await userRef.update({
      tier: 'business',
      teamId: teamRef.id,
      updatedAt: new Date(),
    });

    console.log('✅ User upgraded to Business tier');

    // Verify the update
    console.log('\n🔍 Verifying update...');
    const updatedUserDoc = await userRef.get();
    const updatedData = updatedUserDoc.data();

    console.log('\n✅ Updated user data:');
    console.log(`   Email: ${updatedData.email}`);
    console.log(`   Display Name: ${updatedData.displayName}`);
    console.log(`   Tier: ${updatedData.tier}`);
    console.log(`   Team ID: ${updatedData.teamId}`);

    const teamDoc = await db.collection('teams').doc(teamRef.id).get();
    const teamData = teamDoc.data();
    console.log('\n✅ Team data:');
    console.log(`   Owner: ${teamData.ownerEmail}`);
    console.log(`   Max Seats: ${teamData.maxSeats}`);
    console.log(`   Members: ${teamData.memberIds.length}/${teamData.maxSeats}`);

    console.log('\n✅ Upgrade complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

upgradeToBusinessTier().then(() => process.exit(0)).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
