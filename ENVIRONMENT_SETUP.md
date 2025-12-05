# Environment Variables Setup for Production

## The Issue
The 500 error from `/api/auth/create-session` indicates Firebase Admin SDK is not properly initialized in production. This is almost always due to missing or incorrect environment variables.

---

## Quick Check (After New Deployment)

Once the deployment completes, visit:
```
https://www.lstream.app/api/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-12-05T...",
  "env": {
    "NODE_ENV": "production",
    "hasServiceAccountJson": true,  ← Should be TRUE
    "hasProjectId": false,
    "hasClientEmail": false,
    "hasPrivateKey": "no"
  }
}
```

**If `hasServiceAccountJson` is FALSE**, follow the setup instructions below.

---

## Setup Instructions (Vercel)

### Step 1: Get Your Firebase Service Account JSON

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Click **Generate Key** - this downloads a JSON file
7. Open the JSON file in a text editor

### Step 2: Add Environment Variable to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`studio` or `lstream`)
3. Go to **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Add a new variable:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT_JSON`
   - **Value**: Paste the ENTIRE contents of the JSON file
   - **Environments**: Check all three boxes (Production, Preview, Development)
6. Click **Save**

### Step 3: Redeploy

After saving the environment variable, you MUST redeploy:

**Option A - Trigger Redeploy in Vercel:**
1. Go to **Deployments** tab
2. Click the three dots `...` on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (2-3 minutes)

**Option B - Push a Small Change:**
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin master
```

### Step 4: Verify

Visit: `https://www.lstream.app/api/health`

Should now show:
```json
{
  "env": {
    "hasServiceAccountJson": true  ← NOW TRUE!
  }
}
```

### Step 5: Test Login

Try Google login again - it should now work!

---

## Alternative Setup (Individual Variables)

If you prefer not to use the full JSON, you can set individual variables:

**From your service account JSON file, extract:**

```json
{
  "project_id": "your-project-id",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
}
```

**Add these THREE environment variables in Vercel:**

1. **FIREBASE_PROJECT_ID**: `your-project-id`
2. **FIREBASE_CLIENT_EMAIL**: `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`
3. **FIREBASE_PRIVATE_KEY**: `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n`

**Important for FIREBASE_PRIVATE_KEY:**
- Must include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Must preserve the `\n` characters (newlines)
- Or use actual newlines if Vercel supports multiline

Then redeploy.

---

## Checking Server Logs (Vercel)

To see the actual error:

1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Click on the latest deployment
4. Click **Functions** tab
5. Find `/api/auth/create-session`
6. Click to see the logs

Look for error messages like:
- `Missing Firebase Admin credentials`
- `Failed to parse service account JSON`
- `auth/invalid-credential`
- `ENOENT` (file not found)

**Send me the error log text!**

---

## Common Issues

### Issue 1: JSON is Malformed
**Symptom**: `Unexpected token` or `JSON.parse` error

**Solution**:
- Make sure you copied the ENTIRE JSON file
- Check for missing `{` or `}` brackets
- Verify no extra characters at start/end

### Issue 2: Newlines in Private Key
**Symptom**: `auth/invalid-credential`

**Solution**:
In Vercel, when pasting the JSON, the newlines should be preserved. If not:
- Try wrapping the entire JSON in single quotes
- Or use individual environment variables instead

### Issue 3: Wrong Firebase Project
**Symptom**: `ID token verification failed`

**Solution**:
- Verify the service account is from the SAME Firebase project as your client-side config
- Check `src/firebase/config.ts` matches the project ID

### Issue 4: Service Account Permissions
**Symptom**: `Permission denied`

**Solution**:
- The service account needs **Firebase Admin** role
- Go to Firebase Console → Settings → Service Accounts
- Verify the account has admin permissions

---

## Testing Locally

To test the same setup locally:

1. Download your service account JSON file
2. Save it as `firebase-service-account.json` in project root
3. Add to `.env.local`:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_JSON='<paste entire JSON here>'
   ```
4. Run: `npm run dev`
5. Try login at `http://localhost:3000/login`

---

## Security Note

**NEVER commit service account JSON to Git!**

The `.gitignore` should already exclude:
- `.env.local`
- `firebase-service-account.json`
- Any files with `*-service-account.json` pattern

If you accidentally committed it:
1. Delete the key from Firebase Console immediately
2. Generate a new key
3. Update Vercel environment variables
4. Remove from Git history (use `git filter-branch` or BFG Repo-Cleaner)

---

## Quick Checklist

- [ ] Firebase service account JSON downloaded
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` added to Vercel
- [ ] Environment variable set for Production, Preview, Development
- [ ] Redeployed after adding variable
- [ ] `/api/health` shows `hasServiceAccountJson: true`
- [ ] Server logs checked for errors
- [ ] Login tested and working

---

## Still Not Working?

If after following all steps, login still fails:

1. Visit: `https://www.lstream.app/api/health`
2. Copy the JSON response
3. Check Vercel deployment logs for errors
4. Try Google login and check browser console
5. Share all three with me:
   - Health check JSON
   - Server log errors
   - Browser console errors

I'll help diagnose the exact issue!
