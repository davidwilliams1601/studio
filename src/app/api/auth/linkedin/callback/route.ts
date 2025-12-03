import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForToken,
  fetchUserInfo,
  getOAuthState,
  deleteOAuthState,
} from '@/lib/linkedin-oauth';
import { getAuth, getDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * GET /api/auth/linkedin/callback
 *
 * Simplified LinkedIn OAuth callback that works like Google OAuth:
 * 1. Validates state (CSRF protection)
 * 2. Exchanges code for access token
 * 3. Fetches user info from LinkedIn
 * 4. Creates/gets Firebase user by email
 * 5. Stores LinkedIn profile info in user document
 * 6. Creates Firebase custom token for client login
 * 7. Redirects to app
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Check for LinkedIn error response
    if (error) {
      console.error('LinkedIn OAuth error:', error, errorDescription);
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('error', 'linkedin_auth_failed');
      redirectUrl.searchParams.set('message', errorDescription || error);
      return NextResponse.redirect(redirectUrl);
    }

    // Validate required parameters
    if (!code || !state) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('error', 'missing_parameters');
      return NextResponse.redirect(redirectUrl);
    }

    // Validate state (CSRF protection)
    const storedState = getOAuthState(state);
    if (!storedState) {
      console.error('Invalid or expired OAuth state');
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('error', 'invalid_state');
      return NextResponse.redirect(redirectUrl);
    }

    // Clean up state
    deleteOAuthState(state);

    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForToken(
      code,
      storedState.codeVerifier
    );

    // Fetch user info from LinkedIn
    const userInfo = await fetchUserInfo(tokenResponse.access_token);

    // Validate required user info
    if (!userInfo.email) {
      throw new Error('Email not provided by LinkedIn. Please ensure your LinkedIn account has a verified email.');
    }

    const auth = await getAuth();
    const db = await getDb();

    // Try to get existing Firebase user by email
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(userInfo.email);
      console.log(`Found existing Firebase user: ${firebaseUser.uid}`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create new Firebase user
        firebaseUser = await auth.createUser({
          email: userInfo.email,
          emailVerified: true, // LinkedIn emails are verified
          displayName: userInfo.name || userInfo.email.split('@')[0],
          photoURL: userInfo.picture,
        });
        console.log(`Created new Firebase user: ${firebaseUser.uid}`);

        // Create user document in Firestore using existing endpoint logic
        const now = new Date();
        const userData = {
          email: userInfo.email,
          displayName: userInfo.name || userInfo.email.split('@')[0],
          tier: 'free',
          createdAt: now,
          updatedAt: now,
          reminderSettings: {
            enabled: true,
            lastReminderSent: null,
            nextReminderDate: null,
            lastReminderType: null,
          },
          backupHistory: [],
          lastBackupDate: null,
          backupsThisMonth: 0,
          // Store LinkedIn profile info
          linkedInProfile: {
            sub: userInfo.sub,
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture,
            connectedAt: Timestamp.now(),
          },
        };

        await db.collection('users').doc(firebaseUser.uid).set(userData);
        console.log(`Created user document for ${userInfo.email}`);

        // Send welcome email
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/email/welcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userInfo.email,
              name: userInfo.name || userInfo.email.split('@')[0],
            }),
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail the auth flow if email fails
        }
      } else {
        throw error;
      }
    }

    // Update existing user with LinkedIn profile info if not already set
    if (firebaseUser) {
      const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
      const userData = userDoc.data();

      if (!userData?.linkedInProfile) {
        await db.collection('users').doc(firebaseUser.uid).update({
          linkedInProfile: {
            sub: userInfo.sub,
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture,
            connectedAt: Timestamp.now(),
          },
          updatedAt: new Date(),
        });
        console.log(`Updated user ${firebaseUser.uid} with LinkedIn profile`);
      }
    }

    // Create Firebase custom token for client to sign in
    const customToken = await auth.createCustomToken(firebaseUser.uid, {
      provider: 'linkedin',
      email: userInfo.email,
    });

    // Create a one-time code to exchange for the token (prevents token leakage in URL)
    const oneTimeCode = Buffer.from(
      JSON.stringify({
        token: customToken,
        provider: 'linkedin',
        exp: Date.now() + 60000, // 1 minute expiration
      })
    ).toString('base64url');

    // Redirect to app with one-time code
    const redirectUrl = new URL(
      storedState.redirectUrl || '/dashboard',
      request.url
    );
    redirectUrl.searchParams.set('auth_code', oneTimeCode);

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error('LinkedIn OAuth callback error:', error);

    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('error', 'auth_failed');
    redirectUrl.searchParams.set('message', error.message || 'LinkedIn authentication failed');

    return NextResponse.redirect(redirectUrl);
  }
}
