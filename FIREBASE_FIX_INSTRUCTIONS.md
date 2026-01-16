# Fix Firebase Admin SDK on Vercel

## Problem
Your `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable on Vercel has improperly escaped newlines, causing this error:
```
"Bad control character in string literal in JSON at position 176 (line 5 column 46)"
```

## Solution

### Option 1: Get Fresh Service Account JSON (Recommended)

1. **Download new service account from Firebase:**
   - Go to: https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk
   - Click "Generate new private key"
   - Save the JSON file (e.g., `serviceAccount.json`)

2. **Convert to properly escaped string:**
   ```bash
   node scripts/fix-firebase-env.js path/to/serviceAccount.json
   ```

3. **Copy the output and update Vercel:**
   - Go to: https://vercel.com/davidwilliams1601s-projects/linkstream/settings/environment-variables
   - Find `FIREBASE_SERVICE_ACCOUNT_JSON`
   - Click Edit → Delete it
   - Click "Add New" → Enter name: `FIREBASE_SERVICE_ACCOUNT_JSON`
   - Paste the fixed JSON string from step 2
   - Select environment: Production (and Preview if needed)
   - Click "Save"

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Option 2: Use Vercel CLI

```bash
# Download service account JSON first (see Option 1, step 1)

# Then run:
node scripts/fix-firebase-env.js serviceAccount.json

# Copy the output, then run:
vercel env rm FIREBASE_SERVICE_ACCOUNT_JSON production
vercel env add FIREBASE_SERVICE_ACCOUNT_JSON production
# Paste the fixed JSON when prompted

# Redeploy
vercel --prod
```

### Option 3: Use Individual Environment Variables (Alternative)

Instead of using `FIREBASE_SERVICE_ACCOUNT_JSON`, you can use individual variables:

```bash
vercel env add FIREBASE_PROJECT_ID production
vercel env add FIREBASE_CLIENT_EMAIL production
vercel env add FIREBASE_PRIVATE_KEY production
```

**Important for FIREBASE_PRIVATE_KEY:**
- It must start with `-----BEGIN PRIVATE KEY-----\n`
- It must end with `\n-----END PRIVATE KEY-----\n`
- All line breaks must be `\n` (not actual newlines)
- Copy from your service account JSON's `private_key` field

## Verification

After fixing and redeploying, verify it works:

```bash
curl https://www.lstream.app/api/debug/firebase-admin | jq .
```

Should return:
```json
{
  "status": "success",
  "message": "Firebase Admin SDK is initialized correctly",
  ...
}
```

## Then test login again!

Your login should now work properly. The session creation endpoint will be able to create session cookies successfully.
