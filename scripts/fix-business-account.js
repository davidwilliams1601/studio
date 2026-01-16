// Script to fix David's account - upgrade to business and create team
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

async function fixAccount() {
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
    const email = 'davidwilliams1601@gmail.com';
    const subscriptionId = 'sub_1SpXsMIpQXRH010BKKQjTJSw';

    console.log(`\n🔧 Fixing account for: ${email}\n`);

    // Step 1: Create team
    console.log('1️⃣ Creating team...');
    const teamRef = await db.collection('teams').add({
      ownerId: userId,
      ownerEmail: email,
      subscriptionId: subscriptionId,
      maxSeats: 10,
      memberIds: [userId],
      invites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ Team created: ${teamRef.id}`);

    // Step 2: Update user to business tier and link team
    console.log('\n2️⃣ Upgrading user to Business tier...');
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      tier: 'business',
      teamId: teamRef.id,
      updatedAt: new Date(),
    });

    console.log('✅ User upgraded to Business tier');
    console.log('✅ Team linked to user account');

    // Step 3: Verify changes
    console.log('\n3️⃣ Verifying changes...');
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    console.log('\n📋 Updated Account Status:');
    console.log('  User ID:', userId);
    console.log('  Email:', userData.email);
    console.log('  Tier:', userData.tier);
    console.log('  Team ID:', userData.teamId);
    console.log('  Max Seats:', 10);
    console.log('');
    console.log('✅ Account fixed! User can now access team management at /dashboard/team');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAccount();
