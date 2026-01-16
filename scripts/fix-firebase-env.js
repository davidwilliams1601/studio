#!/usr/bin/env node

/**
 * Fix Firebase Service Account JSON for Vercel
 *
 * This script reads your local service account JSON file and outputs
 * a properly escaped version that can be used as an environment variable
 *
 * Usage:
 *   node scripts/fix-firebase-env.js path/to/serviceAccount.json
 *
 * Then copy the output and set it as FIREBASE_SERVICE_ACCOUNT_JSON in Vercel
 */

const fs = require('fs');
const path = require('path');

function fixFirebaseServiceAccount(filePath) {
  try {
    console.log('Reading service account file:', filePath);

    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Parse it to validate it's valid JSON
    const serviceAccount = JSON.parse(fileContent);

    // Verify required fields
    const requiredFields = ['project_id', 'private_key', 'client_email'];
    for (const field of requiredFields) {
      if (!serviceAccount[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    console.log('✅ Service account JSON is valid');
    console.log('📦 Project ID:', serviceAccount.project_id);
    console.log('📧 Client Email:', serviceAccount.client_email);
    console.log('🔑 Private Key length:', serviceAccount.private_key.length);

    // Convert to a single-line JSON string with escaped newlines
    const escaped = JSON.stringify(serviceAccount);

    console.log('\n' + '='.repeat(80));
    console.log('Copy the text below and set it as FIREBASE_SERVICE_ACCOUNT_JSON in Vercel:');
    console.log('='.repeat(80) + '\n');
    console.log(escaped);
    console.log('\n' + '='.repeat(80));
    console.log('To set in Vercel, run:');
    console.log('='.repeat(80));
    console.log(`vercel env add FIREBASE_SERVICE_ACCOUNT_JSON production`);
    console.log('Then paste the JSON string above when prompted');
    console.log('='.repeat(80));

    return escaped;
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get file path from command line argument
const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node scripts/fix-firebase-env.js path/to/serviceAccount.json');
  console.error('\nAlternatively, you can check your .env files for the service account JSON');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

fixFirebaseServiceAccount(filePath);
