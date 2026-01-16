// Force refresh user's Firebase Auth custom claims
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

async function forceRefreshSession() {
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

    const userId = 'MUuxMbAE5sd75eX3aFeUsQPigtF3';
    const email = 'davidwilliams1601@gmail.com';

    console.log(`\n🔄 Forcing session refresh for: ${email}\n`);

    // Set custom claims to force token refresh
    console.log('1️⃣ Setting custom claims...');
    await admin.auth().setCustomUserClaims(userId, {
      tier: 'business',
      teamId: '49YrtAZxrzTssBJxDcyv',
      refreshedAt: Date.now(),
    });

    console.log('✅ Custom claims set');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('  1. Open browser DevTools (F12)');
    console.log('  2. Go to Application → Storage → Clear site data');
    console.log('  3. Refresh the page');
    console.log('  4. Try logging in again');
    console.log('');
    console.log('🔑 Or use this temp login link:');

    // Generate a password reset link (can use to login)
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    console.log('');
    console.log('Reset/Login Link:');
    console.log(resetLink);
    console.log('');
    console.log('⚠️  This link will let you reset password and login fresh');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

forceRefreshSession();
