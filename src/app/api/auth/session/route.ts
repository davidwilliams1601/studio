import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * POST /api/auth/session
 *
 * Handles three scenarios:
 * 1. Exchanges auth_session cookie for Firebase custom token (LinkedIn OAuth)
 * 2. Exchanges a one-time code for a Firebase custom token (legacy)
 * 3. Verifies a Firebase session cookie (used by middleware)
 */
export async function POST(request: NextRequest) {
  try {
    const { getAuth, getDb } = await import('@/lib/firebase-admin');

    // Check for auth_session cookie (LinkedIn OAuth flow)
    const authSessionCookie = request.cookies.get('auth_session');
    if (authSessionCookie) {
      const db = await getDb();
      const sessionDoc = await db.collection('authSessions').doc(authSessionCookie.value).get();

      if (!sessionDoc.exists) {
        return NextResponse.json(
          { error: 'Invalid or expired authentication session' },
          { status: 401 }
        );
      }

      const sessionData = sessionDoc.data();
      if (!sessionData) {
        return NextResponse.json(
          { error: 'Invalid session data' },
          { status: 401 }
        );
      }

      // Check expiration
      const now = Date.now();
      if (sessionData.expiresAt && sessionData.expiresAt.toMillis() < now) {
        await sessionDoc.ref.delete();
        return NextResponse.json(
          { error: 'Authentication session expired' },
          { status: 401 }
        );
      }

      // Delete the session (one-time use)
      await sessionDoc.ref.delete();

      // Return the custom token
      return NextResponse.json({
        customToken: sessionData.customToken,
      });
    }

    // Check if this is a session verification request from middleware
    const sessionCookie = request.cookies.get('session');
    const contentType = request.headers.get('content-type');

    // Handle session cookie verification (from middleware)
    if (sessionCookie && !contentType?.includes('application/json')) {
      try {
        const auth = await getAuth();

        // Verify the session cookie
        const decodedClaims = await auth.verifySessionCookie(sessionCookie.value, true);

        return NextResponse.json({
          valid: true,
          uid: decodedClaims.uid,
        });
      } catch (error) {
        return NextResponse.json(
          { valid: false, error: 'Invalid session' },
          { status: 401 }
        );
      }
    }

    // Handle one-time code exchange (original functionality)
    const body = await request.json();
    const { auth_code } = body;

    if (!auth_code) {
      return NextResponse.json(
        { error: 'Missing auth_code' },
        { status: 400 }
      );
    }

    // Decode the one-time code
    const decoded = JSON.parse(
      Buffer.from(auth_code, 'base64url').toString('utf-8')
    );

    // Verify expiration
    if (Date.now() > decoded.exp) {
      return NextResponse.json(
        { error: 'Authentication code expired' },
        { status: 401 }
      );
    }

    // Return the custom token
    return NextResponse.json({
      customToken: decoded.token,
    });
  } catch (error: any) {
    console.error('Session endpoint error:', error);

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 400 }
    );
  }
}
