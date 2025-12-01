# LinkStream Launch Setup Guide

This guide walks you through setting up email reminders and launching LinkStream so users can create accounts and receive automated backup reminders.

## What's Implemented

✅ **Complete Email Reminder System:**
- Welcome emails sent automatically when users sign up
- Automated backup reminders based on subscription tier:
  - **Free tier**: Monthly reminders (30, 7, 1 days before)
  - **Pro tier**: Weekly reminders (7, 3, 1 days before)
  - **Business tier**: Monthly suggested reminders (7, 3 days before)
- Overdue backup reminders (weekly if user misses their backup)
- Beautiful HTML email templates with tier-specific branding
- Firestore tracking of user backup history and reminder state
- Vercel cron job running daily at 9 AM UTC

## Required Setup Steps

### 1. Set Up Resend Email Service (5 minutes)

1. **Sign up for Resend** (free tier: 3,000 emails/month)
   - Go to https://resend.com
   - Create an account
   - Verify your email address

2. **Get your API key:**
   - Go to https://resend.com/api-keys
   - Click "Create API Key"
   - Give it a name like "LinkStream Production"
   - Copy the API key (starts with `re_`)

3. **Set up your sending domain (required for production):**
   - Go to https://resend.com/domains
   - Click "Add Domain"
   - Enter your domain (e.g., `linkstream.app`)
   - Add the DNS records shown to your domain provider
   - Wait for verification (usually 5-10 minutes)
   - Your verified domain will allow emails from addresses like `notifications@linkstream.app`

   **For testing:** You can use `onboarding@resend.dev` without domain verification (100 emails/day limit)

### 2. Configure Environment Variables

Add these to your `.env.local` (development) and Vercel environment variables (production):

```bash
# Required for email reminders
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=LinkStream <notifications@yourdomain.com>
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Required for cron job authentication
CRON_SECRET=generate_a_random_string_here

# Already configured (from existing setup)
NEXT_PUBLIC_FIREBASE_API_KEY=...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
STRIPE_SECRET_KEY=...
```

**Generate a CRON_SECRET:**
```bash
# Option 1: Use openssl
openssl rand -base64 32

# Option 2: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Deploy to Vercel

1. **Push your code to GitHub:**
```bash
git add .
git commit -m "Add email reminder system for launch"
git push origin master
```

2. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard (Settings > Environment Variables)
   - Click "Deploy"

3. **Verify Cron Job Setup:**
   - After deployment, go to your Vercel project
   - Navigate to "Settings" > "Cron Jobs"
   - You should see: `/api/cron/send-reminders` scheduled for `0 9 * * *` (daily at 9 AM UTC)
   - Vercel automatically configures this from `vercel.json`

### 4. Test the Email System

#### Test Welcome Emails:
```bash
# After deployment, create a test account
# Go to your production site and sign up
# Check your email for the welcome message
```

#### Test Reminder Emails (Manual Trigger):
```bash
# Call the cron endpoint manually with your CRON_SECRET
curl -X POST https://yourdomain.com/api/cron/send-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Expected response:
{
  "success": true,
  "message": "Processed X users",
  "remindersSent": 0,
  "errors": 0
}
```

**Create a test user with overdue backup** (optional):
1. Sign up for an account
2. Use Firebase Console to manually edit the user document:
   - Set `lastBackupDate` to 35 days ago
   - Set `tier` to "free"
3. Trigger the cron job manually (command above)
4. Check your email for the reminder

### 5. Stripe Setup (for paid plans)

⚠️ **IMPORTANT SECURITY**: Before launch, you MUST rotate your Stripe secret key (it was exposed in git history).

1. **Rotate Stripe Keys:**
   - Go to https://dashboard.stripe.com/apikeys
   - Click on your current secret key > "Roll key"
   - Update `STRIPE_SECRET_KEY` in Vercel environment variables
   - Redeploy

2. **Configure Stripe Products:**
   - Create products for Pro ($8/month) and Business ($15/month) tiers
   - Update `src/lib/subscription-tiers.ts` with Stripe price IDs if needed

### 6. Firebase Security Rules

Ensure your Firestore security rules allow the app to create/update user documents:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Server (via Admin SDK) can read/write all users
    // This is automatically allowed when using firebase-admin
  }
}
```

## How It Works

### User Signup Flow:
1. User signs up → Firebase Auth creates account
2. `AuthContext` calls `/api/users/create` → Creates Firestore document
3. `AuthContext` calls `/api/email/welcome` → Sends welcome email via Resend
4. User is redirected to dashboard

### Backup Upload Flow:
1. User uploads LinkedIn ZIP file → `/api/analyze` processes data
2. Firestore document updated with `lastBackupDate` and `backupsThisMonth`
3. User sees analysis results

### Daily Reminder Flow (9 AM UTC):
1. Vercel Cron triggers `/api/cron/send-reminders`
2. Cron job queries all users from Firestore
3. For each user, checks if reminder needed based on:
   - Subscription tier (free/pro/business)
   - Last backup date
   - Last reminder sent date
   - Reminder schedule (30/7/1 days before, or overdue)
4. Sends reminder email via Resend
5. Updates `reminderSettings.lastReminderSent` in Firestore

## Email Templates

### Welcome Email Features:
- Security-focused messaging
- Step-by-step onboarding instructions
- Direct link to dashboard
- Professional branding with gradient header

### Reminder Email Features:
- Tier-specific content and styling
- Urgency indicators (colors change based on due date)
- Personalized with user's name and tier
- Direct link to dashboard
- Mobile-responsive design

## Monitoring & Debugging

### Check Cron Job Logs:
1. Go to Vercel Dashboard > Your Project > Logs
2. Filter by `/api/cron/send-reminders`
3. Look for successful runs and any errors

### Check Email Delivery:
1. Go to Resend Dashboard > Logs
2. See all sent emails, delivery status, and any bounces
3. View email content and check for errors

### Common Issues:

**Emails not sending:**
- Check RESEND_API_KEY is set correctly
- Verify domain is verified (or use resend.dev for testing)
- Check Vercel logs for errors

**Cron job not running:**
- Verify `vercel.json` exists with cron configuration
- Check Vercel Dashboard > Settings > Cron Jobs
- Ensure CRON_SECRET matches in env vars and requests

**Users not receiving reminders:**
- Check Firestore: ensure `lastBackupDate` and `tier` are set
- Manually trigger cron to test
- Check that reminder logic is calculating correctly

## Production Checklist

Before launching:

- [ ] Resend account created and domain verified
- [ ] RESEND_API_KEY configured in Vercel
- [ ] EMAIL_FROM set to your verified domain
- [ ] NEXT_PUBLIC_APP_URL set to production URL
- [ ] CRON_SECRET generated and configured
- [ ] Stripe secret key rotated (security)
- [ ] Test welcome email by signing up
- [ ] Test reminder email by manual cron trigger
- [ ] Verify Vercel cron job is scheduled
- [ ] Firebase security rules configured
- [ ] Test full user journey: signup → upload → wait for reminder

## Cost Estimates

**Resend Free Tier:**
- 3,000 emails/month free
- Enough for ~1,500 users (welcome + 1 reminder/month)
- $20/month for 50,000 emails if you scale

**Vercel:**
- Cron jobs included in all plans
- 1 cron job (daily reminders) is within free tier limits

**Firebase:**
- Firestore: Free tier covers ~1,000 users with daily cron reads
- Auth: Free for up to 50,000 monthly active users

## Support

If you encounter issues during setup:

1. Check the Vercel deployment logs
2. Check the Resend email logs
3. Review the Firebase Console for user data
4. Test each endpoint individually (welcome email, cron job)

The system is production-ready! Just add the environment variables and deploy. 🚀
