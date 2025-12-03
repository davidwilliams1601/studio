# LinkStream - LinkedIn API Application Documentation

## Application Summary

**Product Name:** LinkStream
**Website:** [Your production URL]
**Company:** [Your company name]
**Contact Email:** [Your email]

## Product Description

LinkStream is an **account security and continuity tool** that helps LinkedIn members protect against account takeover by creating encrypted, user-controlled backups of their own LinkedIn data exports.

LinkStream provides:
- Encrypted backup storage of user-uploaded LinkedIn data exports
- Snapshot analytics showing profile completeness and network composition
- Personalized recommendations to improve profile resilience
- Team collaboration features for recruiting agencies and content creators

### What LinkStream Does

- **User-Uploaded Data Only**: Users manually download their LinkedIn data export and upload it to LinkStream
- **No Scraping**: LinkStream does not scrape, crawl, or automatically fetch data from LinkedIn
- **No Automation**: LinkStream does not automate outreach, messaging, or connection requests
- **Privacy-First**: All data is encrypted, with strict per-user access controls and GDPR compliance

### What LinkStream Does NOT Do

LinkStream explicitly **does not**:
- ❌ Scrape or crawl LinkedIn profiles
- ❌ Automate connection requests or messaging
- ❌ Extract email addresses for marketing purposes
- ❌ Generate mass outreach campaigns
- ❌ Violate LinkedIn's Terms of Service
- ❌ Access data without explicit user consent

## API Usage Request

### Requested Scopes

We are requesting the **minimum required scopes** for user authentication:

```
openid profile email
```

**Justification:**
- `openid`: Required for OpenID Connect authentication
- `profile`: Provides basic profile information (name, photo) for account creation
- `email`: Required to create and verify user accounts

### API Endpoints Needed

**Primary:** OAuth 2.0 Authorization (Sign In with LinkedIn)
**Purpose:** Authenticate users and create Firebase accounts

We are **not requesting** access to:
- Profile API (read/write member profiles)
- Connections API
- Messaging API
- Sharing API

Our product works entirely with **user-uploaded data exports**, so we only need OAuth for authentication.

## Technical Architecture

### Stack Overview

**Frontend:**
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS + Radix UI

**Backend:**
- Next.js API Routes (serverless)
- Firebase Admin SDK
- Node.js runtime

**Database & Storage:**
- Cloud Firestore (user data, backups metadata)
- Firebase Storage (encrypted backup files)
- Firebase Auth (custom token authentication)

**Security:**
- AES-256-GCM encryption for tokens
- Firestore security rules with RBAC
- Storage security rules with per-user isolation
- CSRF protection via OAuth state parameter
- PKCE flow for OAuth

**Compliance:**
- GDPR Article 15 (Right of Access) - Data export endpoint
- GDPR Article 17 (Right to Erasure) - Account deletion endpoint
- Data retention policies (30-day raw, 2-year derived)
- Audit logging for compliance

### OAuth Flow (Simplified - Authentication Only)

```
User clicks "Sign in with LinkedIn"
    ↓
GET /api/auth/linkedin/start
    - Generates CSRF state token
    - Generates PKCE challenge (security best practice)
    - Redirects to LinkedIn authorization
    ↓
User authorizes on LinkedIn
    ↓
LinkedIn redirects to callback
    ↓
GET /api/auth/linkedin/callback?code=xxx&state=xxx
    - Validates state (CSRF protection)
    - Exchanges code for access_token
    - Fetches basic user info (email, name, picture)
    - Creates or finds Firebase user by email
    - Stores LinkedIn profile info in Firestore
    - Sends welcome email for new users
    - Generates Firebase custom token
    - Returns one-time code to client (prevents token URL leakage)
    ↓
Client exchanges one-time code for custom token
    ↓
Client calls Firebase signInWithCustomToken()
    ↓
User authenticated and redirected to dashboard
```

**Key Security Features:**
- CSRF protection via OAuth state parameter
- PKCE (Proof Key for Code Exchange) flow
- One-time codes prevent token leakage in URLs
- Custom tokens have short expiration (1 minute)
- No LinkedIn tokens stored on client

### Data Flow

```
User downloads LinkedIn export → ZIP file on user's device
    ↓
User uploads to LinkStream
    ↓
POST /api/backups/upload
    - Generates signed Storage URL
    - Creates backup document in Firestore
    ↓
Client uploads ZIP to Firebase Storage (using signed URL)
    ↓
POST /api/backups/{id}/process
    - Downloads ZIP from Storage
    - Security checks (ZIP bomb protection, size limits)
    - Parses CSV files (Connections, Profile, Positions, etc.)
    - Generates analytics (industry distribution, completeness score)
    - Creates snapshot document with metrics
    - Updates backup status to "ready"
    ↓
User views dashboard with insights
```

### Security Measures

**Input Validation:**
- File type validation (ZIP only)
- File size limits (100MB upload, 500MB extracted)
- ZIP bomb protection (max files, max extracted size)
- Path traversal prevention
- CSV injection prevention

**Access Control:**
- Row-level security via Firestore rules
- Users can only access their own data
- Org members can only access org-scoped data
- Admin-only operations protected

**Data Protection:**
- OAuth tokens encrypted with AES-256-GCM
- Secrets stored in environment variables
- No secrets in client-side code
- Signed URLs for time-limited Storage access
- Automatic expiration of sensitive data

**Compliance:**
- GDPR-compliant data export (JSON format)
- Right to erasure implementation
- Data retention policies
- Audit logging
- Privacy consent tracking

## Firestore Data Model

**Integrated with existing schema - minimal additions:**

```
users/{uid}
├── email (string)
├── displayName (string)
├── tier (free|pro|business|enterprise)  // Existing field
├── createdAt (timestamp)
├── updatedAt (timestamp)
├── reminderSettings (object)  // Existing
├── backupHistory (array)  // Existing
├── lastBackupDate (timestamp)  // Existing
├── backupsThisMonth (number)  // Existing
└── linkedInProfile (object)  // NEW - Optional LinkedIn info
    ├── sub (string) - LinkedIn member ID
    ├── name (string)
    ├── email (string)
    ├── picture (string)
    └── connectedAt (timestamp)

teams/{teamId}  // NEW - For Business/Enterprise plans
├── teamId (string)
├── name (string)
├── ownerId (string)
├── billing (object)
├── plan (business|enterprise)
├── memberCount (number)
├── createdAt (timestamp)
└── updatedAt (timestamp)

teamMembers/{teamId}_{uid}  // NEW - Team membership
├── uid (string)
├── teamId (string)
├── role (owner|admin|member)
├── createdAt (timestamp)
└── invitedBy (string)

backups/{backupId}  // NEW - LinkedIn backup data
├── backupId (string)
├── uid (string)
├── teamId (string, optional)  // For team accounts
├── source (linkedin_export)
├── status (uploaded|processing|ready|error)
├── storagePaths
│   ├── raw (string) - Storage path to raw ZIP
│   └── derived (string) - Processed analytics
├── retention
│   ├── rawExpiresAt (timestamp)
│   ├── derivedExpiresAt (timestamp)
│   └── keepRawForever (boolean)
├── contains (object) - What data types found
├── fileSize (number)
├── createdAt (timestamp)
└── metadata (object)

backupSnapshots/{uid}/snapshots/{snapshotId}  // NEW - Analytics
├── snapshotId (string)
├── backupId (string)
├── uid (string)
├── createdAt (timestamp)
├── totalConnections (number)
├── connectionsByIndustry (array)
├── connectionsByLocation (array)
├── connectionsByCompany (array)
├── profileCompletenessScore (object)
└── recommendations (array)
```

**Schema Philosophy:**
- Minimal disruption to existing user model
- LinkedIn profile info is optional (only if user signs in with LinkedIn)
- Team features are separate collections (don't affect individual users)
- Backup data is isolated and can be disabled/enabled per tier

## Security Rules

### Firestore Rules Highlights

```javascript
// Users can only read/write their own data
match /users/{uid} {
  allow read: if request.auth.uid == uid;
  allow write: if request.auth.uid == uid;
}

// Backups: owner or org member access
match /backups/{backupId} {
  allow read: if request.auth.uid == resource.data.uid
    || (resource.data.orgId != null && isOrgMember(resource.data.orgId));
}

// Snapshots: owner only
match /backupSnapshots/{uid}/snapshots/{snapshotId} {
  allow read: if request.auth.uid == uid;
}
```

### Storage Rules Highlights

```javascript
// Raw backup files: owner only
match /users/{uid}/linkedin-exports/{backupId}/raw.zip {
  allow write: if request.auth.uid == uid && isZipFile() && isValidSize(100);
  allow read: if request.auth.uid == uid;
}
```

## Use Cases

### Primary Audience

1. **Individual Professionals**
   - Protect against account lockout
   - Backup professional network
   - Track profile completeness

2. **Recruiting Agencies**
   - Team collaboration features
   - Centralized backup management
   - Compliance with data retention policies

3. **Content Creators & Influencers**
   - Monitor network growth
   - Track engagement metrics
   - Protect against platform risk

### User Stories

**As a professional**, I want to backup my LinkedIn data so that I can recover my network if my account is compromised.

**As a recruiter**, I want to store snapshots of candidate profiles so that I can reference them even if the candidate updates their profile.

**As an agency owner**, I want my team members to securely backup their professional networks so we maintain business continuity.

## Compliance & Privacy

### GDPR Compliance

**Article 15 - Right of Access:**
- Endpoint: `GET /api/gdpr/export-data`
- Returns all user data in machine-readable JSON format
- Includes audit log of data processing

**Article 17 - Right to Erasure:**
- Endpoint: `POST /api/gdpr/delete-account`
- Permanently deletes all user data
- Removes Firebase Auth account
- Deletes all Storage files
- Removes all Firestore documents

**Article 25 - Data Protection by Design:**
- Minimal data collection
- Encryption at rest and in transit
- Automated data retention policies
- Strict access controls

### Data Retention

- **Raw backup files:** 30 days (configurable, premium can keep forever)
- **Derived analytics:** 2 years
- **User account data:** Until user deletes account
- **Audit logs:** 1 year

### Privacy by Default

- Users must explicitly consent to data processing
- Opt-in for all features
- Clear privacy policy
- No third-party data sharing
- No advertising or tracking

## Why This Benefits LinkedIn

1. **Account Security:** Helps members protect against account takeover
2. **Data Portability:** Supports LinkedIn's data export feature
3. **Compliance:** Demonstrates LinkedIn's commitment to GDPR
4. **Professional Development:** Helps members improve their profiles
5. **No Scraping:** Reduces unauthorized scraping by providing a legitimate alternative
6. **Terms Compliance:** Operates entirely within LinkedIn's acceptable use policies

## Prohibited Features

LinkStream explicitly **does not** and **will not**:

```javascript
export const PROHIBITED_FEATURES = {
  outreach_automation: false,
  connection_scraping: false,
  mass_messaging: false,
  email_extraction: false,
  profile_scraping: false,
} as const;
```

This object is hardcoded in our application and enforced through code review processes.

## Contact Information

**Developer Contact:** [Your email]
**Company Website:** [Your website]
**Support Email:** [Support email]
**Privacy Policy:** [URL to privacy policy]
**Terms of Service:** [URL to terms]

## Application Checklist

Before submitting to LinkedIn:

- [ ] OAuth client ID and secret configured
- [ ] Redirect URI whitelisted in LinkedIn app settings
- [ ] Privacy policy published and linked
- [ ] Terms of service published and linked
- [ ] App logo uploaded (square, 512x512px minimum)
- [ ] Company verification completed
- [ ] Use case clearly documented
- [ ] Security measures documented
- [ ] GDPR compliance verified
- [ ] Testing completed in development mode

## Production Deployment Checklist

After LinkedIn approval:

- [ ] Environment variables configured in production
- [ ] Firebase rules deployed
- [ ] Storage rules deployed
- [ ] SSL certificate verified
- [ ] Monitoring and logging configured
- [ ] Backup and disaster recovery tested
- [ ] Rate limiting implemented
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Documentation updated

---

## Additional Notes for Reviewers

### Why We Need LinkedIn OAuth

We use LinkedIn OAuth **only for authentication**. We do not request access to any LinkedIn APIs beyond basic profile information for account creation.

The core functionality of LinkStream works with **user-uploaded LinkedIn data exports**, which users download directly from LinkedIn's privacy settings.

### Why This Is Safe for LinkedIn

1. **No automated data access** - Users manually download and upload their data
2. **No TOS violations** - We don't scrape, automate, or access data without permission
3. **Security-focused** - We help users protect their accounts
4. **Compliance-first** - Full GDPR compliance with right to erasure and data export
5. **Professional use case** - Targeted at business users, not spam or lead generation

### Technical Support

For questions about this application, please contact:
- Technical: [Your technical contact]
- Business: [Your business contact]
- Security: [Your security contact]

---

**Last Updated:** [Date]
**Application Version:** 1.0
**Next Review Date:** [Date]
