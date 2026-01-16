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

async function checkUser() {
  const userId = 'MUuxMbAE5sd75eX3aFeUsQPigtF3';
  const userDoc = await db.collection('users').doc(userId).get();
  
  if (userDoc.exists) {
    const data = userDoc.data();
    console.log('✅ User found:', {
      email: data.email,
      tier: data.tier,
      teamId: data.teamId,
      stripeCustomerId: data.stripeCustomerId,
      subscriptionId: data.subscriptionId
    });
    
    // Check team
    if (data.teamId) {
      const teamDoc = await db.collection('teams').doc(data.teamId).get();
      if (teamDoc.exists) {
        console.log('✅ Team found:', {
          id: data.teamId,
          ownerId: teamDoc.data().ownerId,
          maxSeats: teamDoc.data().maxSeats,
          memberCount: teamDoc.data().memberIds.length
        });
      } else {
        console.log('❌ Team not found');
      }
    } else {
      console.log('⚠️  No teamId set');
    }
  } else {
    console.log('❌ User not found');
  }
}

checkUser().then(() => process.exit(0)).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
