# Admin Portal Setup Guide

This guide explains how to set up and use the admin portal for your application.

## Overview

The admin portal provides secure access for administrators to:
- View and manage users
- Monitor analytics and KPIs
- Send bulk emails to users
- Manage subscriptions
- View audit logs

## Security Model

Admin access is controlled through Firebase custom claims. Only users with the `admin: true` custom claim can access admin features.

## Initial Setup

### 1. Grant Admin Access to a User

First, ensure the user account exists in your system (they need to sign up first).

Then, grant admin privileges using the provided script:

```bash
node scripts/set-admin-claim.js admin@example.com
```

**Important:** The user must sign out and sign back in for the admin claim to take effect.

### 2. Verify Admin Access

After signing out and back in, the user can access the admin portal at:

```
https://yourdomain.com/admin/login
```

## Admin Features

### Authentication

The admin login page (`/admin/login`) supports:
- Email/password authentication
- Google OAuth authentication

After successful authentication, the system verifies the user has admin privileges before granting access.

### Admin Dashboard

Located at `/dashboard/admin`, the admin dashboard provides:
- User statistics and KPIs
- Revenue analytics
- Churn metrics
- User management tools
- Bulk email functionality

### API Endpoints

All admin API endpoints require authentication and admin privileges:

- `GET /api/admin/check-role` - Verify admin status
- `GET /api/admin/users` - List all users with filtering
- `GET /api/admin/users/[uid]` - Get detailed user info
- `PUT /api/admin/users/[uid]` - Update user tier/subscription
- `POST /api/admin/users/[uid]` - Refund user subscription
- `DELETE /api/admin/users/[uid]` - Delete user account
- `POST /api/admin/email/send` - Send bulk emails
- `GET /api/admin/analytics` - Get system analytics

### Audit Logging

All admin actions are automatically logged to the `adminAuditLogs` collection in Firestore, including:
- Admin user ID and email
- Action performed
- Target user (if applicable)
- Reason provided
- Timestamp
- Additional metadata

## Managing Admin Users

### Grant Admin Access

```bash
node scripts/set-admin-claim.js user@example.com
```

### Revoke Admin Access

```bash
node scripts/revoke-admin-claim.js user@example.com
```

### Check Admin Status

You can verify a user's admin status by examining their custom claims:

```javascript
const user = await admin.auth().getUserByEmail('user@example.com');
console.log(user.customClaims); // { admin: true }
```

## Security Best Practices

1. **Limit Admin Access**: Only grant admin privileges to trusted users
2. **Monitor Audit Logs**: Regularly review the `adminAuditLogs` collection
3. **Rotate Credentials**: Periodically review and revoke admin access as needed
4. **Use Strong Passwords**: Enforce strong password policies for admin accounts
5. **Enable 2FA**: Consider implementing two-factor authentication for admin accounts

## Environment Variables

Ensure these Firebase Admin SDK credentials are configured:

```bash
# Option 1: Service Account JSON (Recommended for production)
FIREBASE_SERVICE_ACCOUNT_JSON='{"project_id":"...","private_key":"...","client_email":"..."}'

# Option 2: Individual credentials (for local development)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Troubleshooting

### User can't access admin portal after claim is set

**Solution:** The user must sign out and sign back in. Firebase ID tokens are cached and custom claims are only updated when a new token is issued.

### "Admin access required" error

**Causes:**
- User doesn't have admin custom claim set
- User hasn't signed out/in after claim was added
- Invalid or expired authentication token

**Solution:**
1. Verify the admin claim is set: `node scripts/set-admin-claim.js user@example.com`
2. Have the user sign out completely and sign back in
3. Check the browser console for detailed error messages

### Script errors when setting admin claims

**Causes:**
- Missing Firebase Admin credentials
- User email doesn't exist in the system

**Solution:**
1. Verify environment variables are set correctly
2. Ensure the user has signed up for an account first
3. Check the script output for specific error messages

## Development

### Testing Admin Features Locally

1. Grant admin access to your test account:
   ```bash
   node scripts/set-admin-claim.js test@example.com
   ```

2. Sign out and sign back in

3. Navigate to `http://localhost:3000/admin/login`

### Admin Authentication Flow

```
User Login
    ↓
Verify Firebase Auth
    ↓
Check Custom Claims (admin: true)
    ↓
Grant Access to Admin Portal
    ↓
All Admin API calls include ID Token
    ↓
Server verifies token + admin claim
```

## Support

For issues or questions:
1. Check the browser console for error messages
2. Review Firestore audit logs for admin actions
3. Verify Firebase Admin SDK credentials
4. Check that the user has the admin custom claim

## Architecture

### Files

- `/src/app/admin/login/page.tsx` - Admin login page
- `/src/lib/admin-auth.ts` - Admin authentication utilities
- `/src/app/api/admin/check-role/route.ts` - Admin role verification endpoint
- `/src/app/dashboard/admin/` - Admin dashboard pages
- `/scripts/set-admin-claim.js` - Grant admin access script
- `/scripts/revoke-admin-claim.js` - Revoke admin access script

### Database Collections

- `adminAuditLogs` - Audit trail of all admin actions
- `users` - User data (tier, subscription, etc.)

### Custom Claims

Firebase custom claims used:
- `admin: true` - Grants admin portal access
