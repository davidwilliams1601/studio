// Script to check user account and team status
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

async function checkUserAccount() {
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

    const email = 'davidwilliams1601@gmail.com';

    console.log(`\n🔍 Searching for user: ${email}\n`);

    // Find user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.log('❌ No user found with that email');
      process.exit(1);
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    console.log('📋 User Account Details:');
    console.log('  User ID:', userDoc.id);
    console.log('  Email:', userData.email);
    console.log('  Display Name:', userData.displayName || 'N/A');
    console.log('  Tier:', userData.tier);
    console.log('  Team ID:', userData.teamId || 'None');
    console.log('  Stripe Customer ID:', userData.stripeCustomerId || 'None');
    console.log('  Stripe Subscription ID:', userData.stripeSubscriptionId || 'None');
    console.log('  Upgrade Date:', userData.upgradeDate?.toDate() || 'N/A');
    console.log('');

    // Check if team exists
    if (userData.teamId) {
      const teamDoc = await db.collection('teams').doc(userData.teamId).get();

      if (teamDoc.exists) {
        const teamData = teamDoc.data();
        console.log('👥 Team Details:');
        console.log('  Team ID:', teamDoc.id);
        console.log('  Owner ID:', teamData.ownerId);
        console.log('  Owner Email:', teamData.ownerEmail);
        console.log('  Max Seats:', teamData.maxSeats);
        console.log('  Member IDs:', teamData.memberIds);
        console.log('  Pending Invites:', teamData.invites?.length || 0);
        console.log('');
      } else {
        console.log('⚠️  Team ID exists but team document not found!');
      }
    } else {
      console.log('⚠️  No team associated with this user');
      console.log('');

      // Check if any team exists for this user as owner
      const teamsSnapshot = await db.collection('teams')
        .where('ownerId', '==', userDoc.id)
        .limit(1)
        .get();

      if (!teamsSnapshot.empty) {
        console.log('⚠️  Found orphaned team (not linked to user):');
        const teamDoc = teamsSnapshot.docs[0];
        const teamData = teamDoc.data();
        console.log('  Team ID:', teamDoc.id);
        console.log('  Member IDs:', teamData.memberIds);
        console.log('');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserAccount();
