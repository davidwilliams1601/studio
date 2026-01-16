#!/usr/bin/env node

/**
 * Fix Firebase Service Account JSON in .env.production
 * and generate the correct value for Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Firebase Service Account JSON for Vercel...\n');

// Read .env.production
const envPath = path.join(__dirname, '..', '.env.production');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.production not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

// Extract FIREBASE_SERVICE_ACCOUNT_JSON value
const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_JSON=(.+?)(?=\n[A-Z_]+=|\n*$)/s);

if (!match) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_JSON not found in .env.production');
  console.log('\nAlternatively, you can extract it from Vercel:');
  console.log('  1. Go to your Vercel project settings');
  console.log('  2. Go to Environment Variables');
  console.log('  3. Find FIREBASE_SERVICE_ACCOUNT_JSON');
  console.log('  4. Copy the value and save it to a file');
  console.log('  5. Run: node scripts/fix-firebase-env.js <file>');
  process.exit(1);
}

let jsonString = match[1].trim();

// Remove quotes if wrapped
if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
  jsonString = jsonString.slice(1, -1);
}
if (jsonString.startsWith("'") && jsonString.endsWith("'")) {
  jsonString = jsonString.slice(1, -1);
}

console.log('📋 Found FIREBASE_SERVICE_ACCOUNT_JSON in .env.production');
console.log('📏 Raw length:', jsonString.length, 'characters\n');

try {
  // Try to parse it
  const serviceAccount = JSON.parse(jsonString);
  console.log('✅ JSON is valid!');
  console.log('📦 Project ID:', serviceAccount.project_id);
  console.log('📧 Client Email:', serviceAccount.client_email);
  console.log('🔑 Private Key length:', serviceAccount.private_key?.length || 0);

  // Re-stringify to ensure proper escaping
  const fixed = JSON.stringify(serviceAccount);

  console.log('\n' + '='.repeat(80));
  console.log('✨ FIXED JSON (copy this to Vercel):');
  console.log('='.repeat(80) + '\n');
  console.log(fixed);
  console.log('\n' + '='.repeat(80));
  console.log('📝 Next steps:');
  console.log('='.repeat(80));
  console.log('1. Copy the JSON string above');
  console.log('2. Go to Vercel dashboard → Your Project → Settings → Environment Variables');
  console.log('3. Edit FIREBASE_SERVICE_ACCOUNT_JSON');
  console.log('4. Paste the fixed JSON string');
  console.log('5. Redeploy your project');
  console.log('='.repeat(80));

} catch (error) {
  console.error('❌ JSON parsing failed:', error.message);
  console.log('\nThe JSON in .env.production has invalid format.');
  console.log('\n📋 Attempting to fix common issues...\n');

  try {
    // Try to fix common issues
    let fixed = jsonString;

    // If it looks like unescaped JSON, try to parse it as-is
    // Sometimes the env file has literal newlines that need escaping
    fixed = fixed.replace(/\n/g, '\\n');
    fixed = fixed.replace(/\r/g, '');

    const serviceAccount = JSON.parse(fixed);

    console.log('✅ Fixed! JSON is now valid after escaping newlines');
    console.log('📦 Project ID:', serviceAccount.project_id);
    console.log('📧 Client Email:', serviceAccount.client_email);
    console.log('🔑 Private Key length:', serviceAccount.private_key?.length || 0);

    // Re-stringify to ensure proper escaping
    const finalFixed = JSON.stringify(serviceAccount);

    console.log('\n' + '='.repeat(80));
    console.log('✨ FIXED JSON (copy this to Vercel):');
    console.log('='.repeat(80) + '\n');
    console.log(finalFixed);
    console.log('\n' + '='.repeat(80));
    console.log('📝 Next steps:');
    console.log('='.repeat(80));
    console.log('1. Copy the JSON string above');
    console.log('2. Go to Vercel dashboard → Your Project → Settings → Environment Variables');
    console.log('3. Edit or remove and re-add FIREBASE_SERVICE_ACCOUNT_JSON');
    console.log('4. Paste the fixed JSON string');
    console.log('5. Redeploy your project');
    console.log('='.repeat(80));

  } catch (error2) {
    console.error('❌ Still cannot parse JSON:', error2.message);
    console.log('\n📝 Manual fix required:');
    console.log('1. Download your Firebase service account JSON from Firebase Console:');
    console.log('   https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk');
    console.log('2. Run: node scripts/fix-firebase-env.js path/to/serviceAccount.json');
  }
}
