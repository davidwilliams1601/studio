import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/firebase-admin';

/**
 * Logout endpoint
 * Clears the session cookie and revokes the refresh tokens
 */
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;

    // Clear the session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('session', '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Optionally revoke refresh tokens if we have a valid session
    if (sessionCookie) {
      try {
        const auth = await getAuth();
        const decodedClaims = await auth.verifySessionCookie(sessionCookie);
        await auth.revokeRefreshTokens(decodedClaims.uid);
      } catch (error) {
        // Session might already be invalid, that's ok
        console.log('Could not revoke refresh tokens:', error);
      }
    }

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);

    // Even if there's an error, clear the cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('session', '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  }
}
