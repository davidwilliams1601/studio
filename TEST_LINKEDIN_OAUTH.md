# LinkedIn OAuth Testing Guide

## ✅ Pre-Testing Checklist

### 1. LinkedIn Developer App Setup
- [ ] Created LinkedIn Developer App at https://www.linkedin.com/developers/apps
- [ ] Added redirect URI: `http://localhost:9002/api/auth/linkedin/callback`
- [ ] Copied Client ID
- [ ] Copied Client Secret
- [ ] Requested scopes: `openid`, `profile`, `email`

### 2. Environment Variables
- [ ] Added `LINKEDIN_CLIENT_ID` to `.env.local`
- [ ] Added `LINKEDIN_CLIENT_SECRET` to `.env.local`
- [ ] Added `LINKEDIN_REDIRECT_URI` to `.env.local`
- [ ] Generated and added `SESSION_SECRET` to `.env.local`

To generate SESSION_SECRET, run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Firebase Admin Configuration
- [ ] Verified `FIREBASE_PROJECT_ID` in `.env.local`
- [ ] Verified `FIREBASE_CLIENT_EMAIL` in `.env.local`
- [ ] Verified `FIREBASE_PRIVATE_KEY` in `.env.local`

---

## 🧪 Test Scenarios

### Test 1: OAuth Start Endpoint

**Goal:** Verify redirect to LinkedIn works

```bash
# Start dev server
npm run dev

# In browser, visit:
http://localhost:9002/api/auth/linkedin/start
```

**Expected Result:**
- ✅ Redirects to `linkedin.com/oauth/v2/authorization`
- ✅ URL contains `client_id`, `redirect_uri`, `state`, `scope`
- ✅ Scope includes `openid profile email`

**If it fails:**
- Check that `LINKEDIN_CLIENT_ID` is set
- Check that `LINKEDIN_REDIRECT_URI` matches exactly
- Check browser console for errors

---

### Test 2: LinkedIn Authorization Page

**Goal:** Verify LinkedIn accepts your app

**Steps:**
1. After redirect from Test 1, you should see LinkedIn login
2. Sign in with your LinkedIn account
3. LinkedIn shows permission screen asking for:
   - Access to your profile
   - Access to your email

**Expected Result:**
- ✅ LinkedIn authorization screen appears
- ✅ Lists requested permissions clearly
- ✅ Shows your app name and logo

**If it fails:**
- Verify app is approved in LinkedIn Developer Portal
- Check that scopes are configured in Auth tab
- Ensure app is not in "Development" status issues

---

### Test 3: OAuth Callback & User Creation

**Goal:** Complete full OAuth flow

**Steps:**
1. On LinkedIn authorization page, click "Allow"
2. LinkedIn redirects back to your callback

**Expected Result:**
- ✅ Redirects to `http://localhost:9002/dashboard?auth_code=xxx`
- ✅ Page automatically exchanges code for token
- ✅ User is logged in
- ✅ Dashboard loads

**Debug Locations:**
- Server logs (terminal running `npm run dev`)
- Browser console (look for "OAuth callback error")
- Network tab (check `/api/auth/session` response)

**Common Issues:**
- **"Invalid state"** → SESSION_SECRET not set or changed between requests
- **"Invalid redirect_uri"** → Redirect URI doesn't match LinkedIn app settings
- **"Failed to exchange code"** → LINKEDIN_CLIENT_SECRET incorrect

---

### Test 4: User Document Created

**Goal:** Verify Firestore user document created

**Steps:**
1. After successful login, check Firebase Console
2. Go to Firestore Database
3. Look for `users` collection

**Expected Result:**
```
users/{uid}
  email: "your@email.com"
  displayName: "Your Name"
  tier: "free"
  createdAt: [Timestamp]
  updatedAt: [Timestamp]
  linkedInProfile:
    sub: "linkedin_member_id"
    name: "Your Name"
    email: "your@email.com"
    picture: "https://..."
    connectedAt: [Timestamp]
  reminderSettings: {...}
  backupHistory: []
  backupsThisMonth: 0
```

**If missing:**
- Check server logs for "Created user document" message
- Check that Firebase Admin credentials are correct
- Verify Firestore rules don't block creation

---

### Test 5: Welcome Email Sent

**Goal:** Verify email integration works

**Check server logs for:**
```
✅ Welcome email sent successfully
```

**If email fails:**
- Email failure shouldn't break authentication
- Check `RESEND_API_KEY` is set
- Check `/api/email/welcome` endpoint logs

---

### Test 6: Subsequent Login (Existing User)

**Goal:** Verify returning users work

**Steps:**
1. Log out
2. Click "Sign in with LinkedIn" again
3. LinkedIn should auto-authorize (no permission screen)

**Expected Result:**
- ✅ Fast redirect (no permission screen)
- ✅ Logs in to existing account
- ✅ No duplicate user created
- ✅ `linkedInProfile` updated with latest info

---

### Test 7: Account Linking (Same Email)

**Goal:** Test if email/password user can link LinkedIn

**Steps:**
1. Create account with email: `test@example.com`
2. Log out
3. Sign in with LinkedIn using same email: `test@example.com`

**Expected Result:**
- ✅ Links to existing Firebase account
- ✅ Same UID, just adds `linkedInProfile` field
- ✅ User data preserved

**Verify in Firestore:**
- Same user document
- `linkedInProfile` field added
- No duplicate users

---

## 🐛 Debugging Checklist

### Server Logs to Check

Look for these messages in terminal:

```bash
# OAuth Start
✅ "Building LinkedIn authorization URL"

# OAuth Callback
✅ "Found existing Firebase user: {uid}"
   OR
✅ "Created new Firebase user: {uid}"

✅ "Created user document for {email}"
   OR
✅ "Updated user {uid} with LinkedIn profile"

✅ "Welcome email sent successfully"
   OR
⚠️  "Failed to send welcome email" (non-blocking)
```

### Browser Console Logs

```javascript
// Should NOT see:
❌ "OAuth callback error"
❌ "Failed to exchange authentication code"
❌ "Authentication failed"

// Should see:
✅ Navigation to /dashboard
✅ Firebase auth state changes
```

### Network Tab

Check these requests:

1. **GET `/api/auth/linkedin/start`**
   - Status: 302 (redirect)
   - Location header points to LinkedIn

2. **GET `/api/auth/linkedin/callback?code=xxx`**
   - Status: 302 (redirect)
   - Location: `/dashboard?auth_code=xxx`

3. **POST `/api/auth/session`**
   - Status: 200
   - Response: `{ "customToken": "..." }`

---

## 🔒 Security Tests

### Test 8: State Parameter Validation

**Goal:** Verify CSRF protection

**Steps:**
1. Start OAuth flow
2. In callback URL, change `state` parameter
3. Try to complete flow

**Expected Result:**
- ❌ Rejects with "Invalid state" error
- ✅ Redirects to `/login?error=invalid_state`

### Test 9: Code Reuse Prevention

**Goal:** Verify codes can't be reused

**Steps:**
1. Complete OAuth flow
2. Copy callback URL with `auth_code`
3. Try to use same URL again

**Expected Result:**
- ❌ Rejects with "Authentication code expired"
- ✅ One-time codes expire after 1 minute

### Test 10: Redirect URI Validation

**Goal:** Verify LinkedIn enforces redirect URI

**Steps:**
1. Change `LINKEDIN_REDIRECT_URI` in `.env.local`
2. Restart server
3. Try OAuth flow

**Expected Result:**
- ❌ LinkedIn rejects with "Invalid redirect_uri"
- ✅ Must match exactly what's in LinkedIn app settings

---

## ✅ Success Criteria

Your LinkedIn integration is working if:

- [x] OAuth start redirects to LinkedIn
- [x] LinkedIn authorization page appears
- [x] Callback completes successfully
- [x] User document created in Firestore
- [x] User logged in to dashboard
- [x] Welcome email sent (optional)
- [x] Subsequent logins work
- [x] No errors in server logs
- [x] No errors in browser console
- [x] Security checks pass

---

## 📊 Test Results Template

Copy this and fill it out:

```
LinkedIn OAuth Test Results
==========================

Environment:
- Node version:
- Next.js dev server port: 9002
- Firebase project: linkstream-ystti

Test 1 - OAuth Start:           [ ]
Test 2 - LinkedIn Auth Page:    [ ]
Test 3 - Callback & Login:      [ ]
Test 4 - User Document:         [ ]
Test 5 - Welcome Email:         [ ]
Test 6 - Subsequent Login:      [ ]
Test 7 - Account Linking:       [ ]
Test 8 - State Validation:      [ ]
Test 9 - Code Reuse:            [ ]
Test 10 - Redirect Validation:  [ ]

Issues Found:
1.
2.
3.

Notes:


Tested by: _____________
Date: _____________
```

---

## 🚨 Common Errors & Solutions

### Error: "Missing required LinkedIn OAuth environment variables"

**Solution:**
```bash
# Verify .env.local has:
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_REDIRECT_URI=...
SESSION_SECRET=...

# Restart dev server
npm run dev
```

### Error: "redirect_uri_mismatch"

**Solution:**
- Check LinkedIn app settings → Auth tab
- Redirect URI must EXACTLY match:
  - ✅ `http://localhost:9002/api/auth/linkedin/callback`
  - ❌ `http://localhost:9002/api/auth/linkedin/callback/`  (trailing slash)
  - ❌ `https://localhost:9002/api/auth/linkedin/callback` (https)

### Error: "Email not provided by LinkedIn"

**Solution:**
- User's LinkedIn account must have verified email
- Check LinkedIn app has `email` scope requested
- User must approve email permission

### Error: "Invalid or expired OAuth state"

**Solution:**
- Generate new SESSION_SECRET
- Restart dev server
- Clear browser cookies
- Try OAuth flow again

### Error: "auth/user-not-found" or Firebase Admin errors

**Solution:**
```bash
# Check Firebase Admin credentials in .env.local:
FIREBASE_PROJECT_ID=linkstream-ystti
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@linkstream-ystti.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Note: Private key must include \n characters for newlines
```

---

## 📞 Need Help?

If tests fail:

1. **Check server logs** (terminal)
2. **Check browser console** (F12)
3. **Check Network tab** (F12 → Network)
4. **Review error messages** carefully
5. **Share specific error** for debugging

Common places to check:
- `src/app/api/auth/linkedin/callback/route.ts:185` (error handling)
- `src/lib/linkedin-oauth.ts` (OAuth helpers)
- Firebase Console → Authentication
- Firebase Console → Firestore
- LinkedIn Developer Portal → App → Monitoring

---

Good luck testing! 🚀
