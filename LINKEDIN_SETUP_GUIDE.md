# LinkStream - LinkedIn Integration Setup Guide

## Quick Start

This guide walks you through setting up LinkedIn OAuth integration for LinkStream.

## Prerequisites

1. LinkedIn Developer Account
2. Firebase Project (already configured)
3. Vercel Account (for deployment)
4. Production domain (for LinkedIn redirect URI)

## Step 1: Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in details:
   - **App name:** LinkStream
   - **LinkedIn Page:** Your company page (create one if needed)
   - **App logo:** Upload a square logo (512x512px minimum)
   - **Legal:** Accept terms

## Step 2: Configure OAuth Settings

### In LinkedIn Developer Portal:

1. Go to your app → **Auth** tab
2. Add **Redirect URLs:**
   ```
   http://localhost:9002/api/auth/linkedin/callback (development)
   https://yourdomain.com/api/auth/linkedin/callback (production)
   ```

3. Under **OAuth 2.0 scopes**, request:
   - ✅ `openid`
   - ✅ `profile`
   - ✅ `email`

4. Save your credentials:
   - **Client ID:** (copy this)
   - **Client Secret:** (copy this)

## Step 3: Update Environment Variables

Add to `.env.local`:

```bash
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:9002/api/auth/linkedin/callback

# Session Secret (generate a strong random string)
SESSION_SECRET=your_random_32_character_secret_here
```

Generate a secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Deploy Firebase Rules

Deploy Firestore and Storage security rules:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init firestore storage

# Deploy rules
firebase deploy --only firestore:rules,storage:rules
```

## Step 5: Test OAuth Flow Locally

1. Start the development server:
```bash
npm run dev
```

2. Navigate to:
```
http://localhost:9002/api/auth/linkedin/start
```

3. You should be redirected to LinkedIn
4. After authorizing, you should be redirected back to your app

## Step 6: Verify Integration

### Test Authentication:

```bash
# Start OAuth flow
curl http://localhost:9002/api/auth/linkedin/start
# Follow the redirect in a browser

# After successful auth, verify user was created in Firebase Auth
# Check Firestore for user document
```

### Test Upload Flow:

```bash
# Get ID token from Firebase
ID_TOKEN="your_firebase_id_token"

# Request upload URL
curl -X POST http://localhost:9002/api/backups/upload \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "linkedin-export.zip",
    "fileSize": 1000000,
    "contentType": "application/zip"
  }'

# Use the returned signedUrl to upload your file
# Then trigger processing
curl -X POST http://localhost:9002/api/backups/{backupId}/process \
  -H "Authorization: Bearer $ID_TOKEN"
```

## Step 7: Apply for LinkedIn API Access

1. Go to your app in LinkedIn Developer Portal
2. Click on **Products** tab
3. Request access to "Sign In with LinkedIn using OpenID Connect"
4. Fill out the application form:
   - **Use case:** Authentication only
   - **App description:** Use the description from `LINKEDIN_API_APPLICATION.md`
   - **Privacy policy:** Link to your privacy policy
   - **Terms of service:** Link to your terms

### Application Tips:

**Do emphasize:**
- ✅ Authentication only
- ✅ User-uploaded data
- ✅ No scraping or automation
- ✅ Security and backup focus
- ✅ GDPR compliance

**Don't mention:**
- ❌ Lead generation
- ❌ Marketing automation
- ❌ Data mining
- ❌ Connection extraction

## Step 8: Production Deployment

### Update Vercel Environment Variables:

```bash
vercel env add LINKEDIN_CLIENT_ID
vercel env add LINKEDIN_CLIENT_SECRET
vercel env add LINKEDIN_REDIRECT_URI
vercel env add SESSION_SECRET
```

### Update LinkedIn Redirect URI:

1. Go to LinkedIn Developer Portal
2. Add production redirect URI:
   ```
   https://your-production-domain.com/api/auth/linkedin/callback
   ```

### Deploy:

```bash
# Deploy to production
vercel --prod

# Verify deployment
curl https://your-production-domain.com/api/auth/linkedin/start
```

## Step 9: Test in Production

### Manual Testing Checklist:

- [ ] OAuth flow starts correctly
- [ ] LinkedIn authorization page appears
- [ ] After authorization, redirects back to app
- [ ] User is created in Firebase Auth
- [ ] User document is created in Firestore
- [ ] Can upload LinkedIn export ZIP
- [ ] ZIP is parsed and processed correctly
- [ ] Dashboard shows analytics
- [ ] GDPR export works
- [ ] GDPR deletion works
- [ ] Security rules prevent unauthorized access

### Automated Testing:

Create test accounts and run through the flow:
1. New user signup
2. Upload backup
3. View dashboard
4. Export data
5. Delete account

## API Endpoints Summary

### Authentication:
- `GET /api/auth/linkedin/start` - Start OAuth flow
- `GET /api/auth/linkedin/callback` - OAuth callback
- `POST /api/auth/session` - Exchange one-time code for token

### Backups:
- `POST /api/backups/upload` - Get signed upload URL
- `POST /api/backups/[backupId]/process` - Process uploaded backup
- `GET /api/backups` - List user's backups
- `DELETE /api/backups/[backupId]` - Delete backup

### GDPR Compliance:
- `GET /api/gdpr/export-data` - Export all user data
- `POST /api/gdpr/delete-account` - Delete account and all data

### Cron Jobs:
- `GET /api/cron/cleanup-expired-backups` - Clean up expired backups (runs daily at 2 AM)

## Monitoring & Logs

### View Logs:

```bash
# Vercel logs
vercel logs

# Firebase logs
firebase functions:log

# View specific function
vercel logs --follow
```

### Key Metrics to Monitor:

- OAuth success rate
- Upload success rate
- Processing time for backups
- Error rates
- Storage usage
- API response times

## Troubleshooting

### "Invalid redirect_uri"
- Ensure redirect URI is exactly configured in LinkedIn app
- Check for trailing slashes
- Verify protocol (http vs https)

### "Invalid state"
- State may have expired (10 minute timeout)
- Try the flow again
- Check that SESSION_SECRET is consistent

### "Failed to parse export"
- LinkedIn export format may have changed
- Check parser logs for specific error
- Verify ZIP file is valid LinkedIn export

### "Permission denied" in Firestore
- Verify security rules are deployed
- Check that user is authenticated
- Verify uid matches document path

## Security Checklist

- [ ] All secrets in environment variables
- [ ] SESSION_SECRET is strong random string
- [ ] Firestore rules deployed and tested
- [ ] Storage rules deployed and tested
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't include tokens or secrets
- [ ] HTTPS enforced in production
- [ ] LinkedIn app verified

## Support

If you encounter issues:

1. Check the logs (Vercel and Firebase)
2. Review the error messages
3. Verify environment variables are set
4. Check Firebase console for rule errors
5. Test with LinkedIn's OAuth test tool

## Next Steps

After successful setup:

1. ✅ Implement upload UI component
2. ✅ Build dashboard with analytics visualization
3. ✅ Add AI recommendations using Genkit
4. ✅ Create privacy policy page
5. ✅ Create terms of service page
6. ✅ Add team/org management UI
7. ✅ Implement email notifications
8. ✅ Set up monitoring and alerts

---

**Need Help?** Review `LINKEDIN_API_APPLICATION.md` for detailed architecture and compliance information.
