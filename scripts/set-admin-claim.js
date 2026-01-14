/**
 * Script to grant admin privileges to a user
 *
 * Usage:
 *   node scripts/set-admin-claim.js user@example.com
 *
 * This script sets the custom 'admin' claim on the user's Firebase Auth record,
 * which is required for accessing the admin portal.
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Try to get service account from JSON first
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.log('Using FIREBASE_SERVICE_ACCOUNT_JSON');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  // Fall back to individual environment variables
  else {
    console.log('Using individual environment variables');
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error('❌ Missing Firebase Admin credentials');
      console.error('Please set FIREBASE_SERVICE_ACCOUNT_JSON or individual credentials');
      process.exit(1);
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }
}

async function setAdminClaim(email) {
  try {
    console.log(`\n🔍 Looking up user: ${email}`);

    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${user.uid}`);

    // Set admin custom claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Admin claim granted to ${email}`);
    console.log(`\n📝 User must sign out and sign back in for changes to take effect.\n`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error:`, error.message);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error(`
❌ Usage: node scripts/set-admin-claim.js <email>

Example:
  node scripts/set-admin-claim.js admin@example.com

This will grant admin privileges to the specified user.
`);
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error(`❌ Invalid email format: ${email}`);
  process.exit(1);
}

setAdminClaim(email);
