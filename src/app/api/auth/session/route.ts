import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/session
 *
 * Exchanges a one-time code for a Firebase custom token
 * This prevents token leakage in URL parameters
 */
export async function POST(request: NextRequest) {
  try {
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
    console.error('Session exchange error:', error);

    return NextResponse.json(
      { error: 'Invalid authentication code', details: error.message },
      { status: 400 }
    );
  }
}
