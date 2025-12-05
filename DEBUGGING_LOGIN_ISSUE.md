# Debugging Login Issue - Step by Step Guide

## Current Situation
After Google login, you're being redirected to `/login?redirect=%2Fdashboard` instead of the dashboard.

## Added Logging
I've added extensive console logging to help diagnose the issue. Here's what to do:

---

## Step 1: Open Browser Developer Tools

1. Go to https://www.lstream.app/login
2. Open Developer Tools (F12 or Right-click > Inspect)
3. Go to the **Console** tab
4. Clear the console (click the 🚫 icon)

---

## Step 2: Attempt Google Login

Click "Continue with Google" and complete the authentication.

Watch the console for these log messages:

### Expected Log Sequence:
```
Starting Google auth...
Signing in with Google popup...
Google sign in successful, user: <user-id>
Getting ID token...
ID token obtained, creating session cookie...
[create-session] Received session creation request
[create-session] Getting Firebase Auth instance
[create-session] Creating session cookie...
[create-session] Session cookie created successfully
[create-session] Setting cookie with options: { ... }
[create-session] Session cookie set successfully
Session cookie created successfully
Google auth successful
Redirecting to: /dashboard
[middleware] Request to: /dashboard
[middleware] Protected route detected
[middleware] Session cookie present: true
```

### If You See an Error:
Look for any red error messages that say:
- `Session cookie creation failed:`
- `Google auth error:`
- `Failed to create session:`

**Copy the entire error message!**

---

## Step 3: Check Network Tab

1. Go to the **Network** tab in DevTools
2. Filter by "Fetch/XHR"
3. Look for a request to `/api/auth/create-session`

### Check the Request:
- **Status**: Should be `200 OK`
- **Response**: Should be `{ "success": true }`

### If Status is NOT 200:
- Click on the request
- Go to the **Response** tab
- Copy the error message

---

## Step 4: Check Cookies

1. Go to the **Application** tab (or **Storage** in Firefox)
2. Expand **Cookies** in the left sidebar
3. Click on `https://www.lstream.app`

### Look for the `session` Cookie:
- **Name**: `session`
- **Value**: Should be a long string (JWT token)
- **HttpOnly**: ✅ Should be checked
- **Secure**: ✅ Should be checked (in production)
- **SameSite**: `Lax`
- **Path**: `/`
- **Expires**: Should be 5 days in the future

### If `session` Cookie is Missing:
This is the problem! The cookie isn't being set properly.

### If `session` Cookie is Present:
The issue might be with the middleware not reading it correctly.

---

## Step 5: Check Redirect Behavior

After Google login completes, watch the URL bar:

1. Does it briefly show `/dashboard` then redirect to `/login`?
2. Or does it go straight to `/login` without trying `/dashboard`?

**If it goes straight to `/login`:**
- The session cookie creation might be failing
- Check console for errors

**If it briefly shows `/dashboard` then redirects:**
- The middleware might not be detecting the cookie
- Check the middleware logs in console

---

## Common Issues & Solutions

### Issue 1: Cookie Domain Mismatch
**Symptom**: Cookie is set but middleware can't read it

**Check**:
- Is your URL `www.lstream.app` or `lstream.app` (without www)?
- Cookies set on one won't be available on the other

**Solution**: Use consistent URL (either always with `www` or always without)

### Issue 2: CORS/Cookie Policy
**Symptom**: `/api/auth/create-session` returns 200 but cookie isn't set

**Possible causes**:
- Browser blocking third-party cookies
- Incognito/Private mode restrictions

**Solution**:
- Try in normal (non-incognito) browser window
- Check browser cookie settings

### Issue 3: Timing Issue
**Symptom**: Cookie is set but redirect happens too fast

**Check console for**:
```
Session cookie created successfully
Redirecting to: /dashboard
[middleware] Session cookie present: false  ← Should be true!
```

**If middleware says `false` immediately after creation:**
This is a timing issue where the redirect happens before the cookie is committed.

### Issue 4: Firebase Admin SDK Not Initialized
**Symptom**: Error in console: `Failed to create session cookie`

**Check server logs** for Firebase initialization errors

---

## What to Report Back

Please send me:

1. **Console logs** (copy all text from console)
2. **Network tab screenshot** of `/api/auth/create-session` request
3. **Application tab screenshot** of Cookies section
4. **Any error messages** you see

Also answer:
- Are you using `www.lstream.app` or `lstream.app` ?
- Are you in incognito/private mode?
- What browser are you using?

---

## Quick Test

Try this in the browser console after logging in:

```javascript
// Check if cookies are accessible (session won't show because it's httpOnly)
document.cookie

// Check current user
console.log('User:', auth?.currentUser)

// Manually check for session cookie (won't work for httpOnly, but confirms)
// You'll need to check in Application tab instead
```

---

## Temporary Workaround

If you need immediate access while we debug:

1. After Google login fails
2. Open **Application** tab > **Cookies**
3. Check if `session` cookie exists
4. If it does, manually navigate to: `https://www.lstream.app/dashboard`
5. If middleware still blocks you, the cookie isn't being read correctly

---

## Next Steps

Once you provide the debug information, I can:
1. Fix the cookie domain if that's the issue
2. Add a delay/retry mechanism if it's a timing issue
3. Fix any Firebase Admin SDK configuration issues
4. Adjust cookie settings if there's a browser compatibility issue

---

**Let me know what you find in the console logs and Network tab!**
