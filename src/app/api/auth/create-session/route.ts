import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/firebase-admin';

/**
 * Create Firebase session cookie from ID token
 * This endpoint is called after successful client-side authentication
 * to create a server-side session cookie that middleware can verify
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[create-session] Received session creation request');
    const { idToken } = await request.json();

    if (!idToken) {
      console.error('[create-session] No ID token provided');
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify the ID token and create a session cookie
    console.log('[create-session] Getting Firebase Auth instance');
    const auth = await getAuth();

    if (!auth) {
      console.error('[create-session] Firebase Auth instance is null/undefined');
      throw new Error('Firebase Admin SDK not properly initialized');
    }

    console.log('[create-session] Firebase Auth instance obtained successfully');

    // First verify the ID token is valid
    console.log('[create-session] Verifying ID token...');
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      console.log('[create-session] ID token verified, user:', decodedToken.uid);
    } catch (verifyError: any) {
      console.error('[create-session] ID token verification failed:', verifyError.message);
      throw verifyError;
    }

    // Set session to expire in 5 days (max is 14 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
    console.log('[create-session] Session will expire in:', expiresIn, 'ms (5 days)');

    // Create the session cookie
    console.log('[create-session] Creating session cookie...');
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    console.log('[create-session] Session cookie created successfully');

    // Build cookie header manually to ensure it's set correctly
    const isProduction = process.env.NODE_ENV === 'production';
    const maxAge = Math.floor(expiresIn / 1000); // Convert to seconds

    // Manual Set-Cookie header (more reliable than Next.js cookie API)
    const cookieParts = [
      `session=${sessionCookie}`,
      'Path=/',
      `Max-Age=${maxAge}`,
      'HttpOnly',
      'SameSite=Lax',
    ];

    if (isProduction) {
      cookieParts.push('Secure');
    }

    const cookieHeader = cookieParts.join('; ');

    console.log('[create-session] Setting cookie manually:', {
      cookieLength: sessionCookie.length,
      maxAge,
      isProduction,
      cookieHeaderLength: cookieHeader.length,
    });

    // Create response with manual Set-Cookie header
    const response = NextResponse.json({ success: true });

    // Set cookie using raw header (bypass Next.js cookie API)
    response.headers.set('Set-Cookie', cookieHeader);

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || 'https://www.lstream.app');

    console.log('[create-session] Cookie header set successfully');
    return response;
  } catch (error: any) {
    console.error('[create-session] Failed to create session cookie');
    console.error('[create-session] Error code:', error.code);
    console.error('[create-session] Error message:', error.message);
    console.error('[create-session] Full error:', JSON.stringify(error, null, 2));

    // Provide specific error messages for common issues
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { error: 'ID token expired. Please sign in again.', code: error.code },
        { status: 401 }
      );
    }

    if (error.code === 'auth/invalid-id-token') {
      return NextResponse.json(
        { error: 'Invalid ID token. Please sign in again.', code: error.code },
        { status: 401 }
      );
    }

    if (error.code === 'auth/argument-error') {
      return NextResponse.json(
        {
          error: 'Invalid session cookie configuration. Please contact support.',
          code: error.code,
          details: error.message
        },
        { status: 500 }
      );
    }

    // Return detailed error for debugging
    return NextResponse.json(
      {
        error: 'Failed to create session',
        code: error.code || 'unknown',
        message: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
