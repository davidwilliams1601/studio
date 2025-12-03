# 🔐 Setting Up LinkedIn Credentials

## Step 1: Generate SESSION_SECRET

Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (it will be a long random string like: `7a8f3c2e1b9d4f6a8c2e5b7d9f1a3c5e...`)

## Step 2: Update .env.local

Open `/Users/dwilliams/Desktop/studio/.env.local` and replace these lines:

```bash
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=your_actual_client_id_from_linkedin
LINKEDIN_CLIENT_SECRET=your_actual_client_secret_from_linkedin
LINKEDIN_REDIRECT_URI=http://localhost:9002/api/auth/linkedin/callback
SESSION_SECRET=paste_the_random_string_you_generated
```

**Example (with fake values):**
```bash
LINKEDIN_CLIENT_ID=86abc9defgh123
LINKEDIN_CLIENT_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ
LINKEDIN_REDIRECT_URI=http://localhost:9002/api/auth/linkedin/callback
SESSION_SECRET=7a8f3c2e1b9d4f6a8c2e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9
```

## Step 3: Verify Firebase Admin Credentials

Make sure these are also in your `.env.local`:

```bash
FIREBASE_PROJECT_ID=linkstream-ystti
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@linkstream-ystti.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Check if these exist:**
- If missing, you need to download a service account key from Firebase Console
- Go to: Firebase Console → Project Settings → Service Accounts
- Click "Generate new private key"
- Copy the values to `.env.local`

## Step 4: Save and Restart

1. Save `.env.local`
2. Stop your dev server (Ctrl+C)
3. Start it again:
   ```bash
   npm run dev
   ```

## ✅ Verify Configuration

Visit this URL to test if credentials are working:
```
http://localhost:9002/api/auth/linkedin/start
```

**Expected behavior:**
- ✅ Redirects to LinkedIn (login.linkedin.com)
- ❌ If you see an error about missing env vars, credentials aren't loaded

**If it doesn't redirect:**
1. Check `.env.local` has all variables
2. Make sure you restarted the dev server
3. Check terminal for error messages

---

## 🔒 Security Notes

**Never commit these to Git!**

Your `.env.local` should be in `.gitignore` (it already is). Never:
- ❌ Commit `.env.local` to GitHub
- ❌ Share your Client Secret publicly
- ❌ Include credentials in screenshots
- ❌ Post credentials in Slack/Discord

**Where credentials come from:**
- `LINKEDIN_CLIENT_ID` → LinkedIn Developer Portal → Your App → Auth tab
- `LINKEDIN_CLIENT_SECRET` → LinkedIn Developer Portal → Your App → Auth tab
- `SESSION_SECRET` → You generate this (random string)
- Firebase credentials → Firebase Console → Service Accounts

---

## 📋 Checklist

Before testing, verify:

- [ ] LinkedIn Developer account created
- [ ] LinkedIn Company Page created
- [ ] LinkedIn App created
- [ ] Redirect URL added: `http://localhost:9002/api/auth/linkedin/callback`
- [ ] Client ID copied to `.env.local`
- [ ] Client Secret copied to `.env.local`
- [ ] SESSION_SECRET generated and added to `.env.local`
- [ ] Firebase credentials in `.env.local`
- [ ] Dev server restarted
- [ ] No errors in terminal

**When all checked, you're ready to test!** 🚀

---

## 🆘 Common Issues

### "Missing required LinkedIn OAuth environment variables"
- Make sure `.env.local` exists in project root
- Check variable names match exactly (case-sensitive)
- Restart dev server after changing `.env.local`

### "redirect_uri_mismatch"
- LinkedIn app redirect URL must be exactly: `http://localhost:9002/api/auth/linkedin/callback`
- No trailing slash
- Must be `http` not `https` for localhost
- Must be on port 9002 (your dev server port)

### "unauthorized_client"
- Client ID or Client Secret is wrong
- Copy-paste again from LinkedIn Developer Portal
- Make sure no extra spaces

### Environment variables not loading
```bash
# Verify they're set:
node -e "console.log(process.env.LINKEDIN_CLIENT_ID)"

# Should output your client ID
# If it outputs 'undefined', .env.local isn't being loaded
```

---

Need help? Check `TEST_LINKEDIN_OAUTH.md` for detailed debugging steps!
