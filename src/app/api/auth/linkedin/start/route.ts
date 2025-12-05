import { NextRequest, NextResponse } from 'next/server';
import {
  generateState,
  generatePKCE,
  buildAuthorizationUrl,
  storeOAuthState,
  validateLinkedInConfig,
} from '@/lib/linkedin-oauth';

/**
 * GET /api/auth/linkedin/start
 *
 * Initiates the LinkedIn OAuth flow
 * Redirects user to LinkedIn authorization page
 */
export async function GET(request: NextRequest) {
  try {
    // Validate LinkedIn configuration
    validateLinkedInConfig();

    // Generate CSRF protection state
    const state = generateState();

    // Generate PKCE challenge (optional but recommended)
    const { codeVerifier, codeChallenge } = generatePKCE();

    // Get redirect URL from query params or default to dashboard
    const searchParams = request.nextUrl.searchParams;
    const redirectUrl = searchParams.get('redirect') || '/dashboard';

    // Store state in Firestore (secure for serverless)
    await storeOAuthState({
      state,
      codeVerifier,
      redirectUrl,
      createdAt: Date.now(),
    });

    // Build LinkedIn authorization URL
    const authUrl = buildAuthorizationUrl(state, codeChallenge);

    // Redirect to LinkedIn
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('LinkedIn OAuth start error:', error);

    return NextResponse.json(
      {
        error: 'Failed to initiate LinkedIn authentication',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
