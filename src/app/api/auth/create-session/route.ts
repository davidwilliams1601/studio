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

    // Set session to expire in 5 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds

    // Create the session cookie
    console.log('[create-session] Creating session cookie...');
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    console.log('[create-session] Session cookie created successfully');

    // Set the session cookie
    const response = NextResponse.json({ success: true });

    const cookieOptions = {
      maxAge: expiresIn / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    console.log('[create-session] Setting cookie with options:', {
      ...cookieOptions,
      cookieLength: sessionCookie.length,
      isProduction: process.env.NODE_ENV === 'production',
    });

    response.cookies.set('session', sessionCookie, cookieOptions);

    console.log('[create-session] Session cookie set successfully');
    return response;
  } catch (error: any) {
    console.error('Failed to create session cookie:', error);

    // Provide specific error messages for common issues
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { error: 'ID token expired. Please sign in again.' },
        { status: 401 }
      );
    }

    if (error.code === 'auth/invalid-id-token') {
      return NextResponse.json(
        { error: 'Invalid ID token. Please sign in again.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
