// src/app/api/email/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Unsubscribe from marketing emails using a token
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the token
    const verification = verifyUnsubscribeToken(token);

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.reason || 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const email = verification.email;

    // Find user by email and update preferences
    const db = await getDb();
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      'emailPreferences.marketing': false,
      'emailPreferences.unsubscribedAt': new Date(),
    });

    console.log(`✅ User ${email} unsubscribed from marketing emails`);

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from marketing emails',
      email,
    });
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

/**
 * Check token validity without unsubscribing (for preview)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the token
    const verification = verifyUnsubscribeToken(token);

    if (!verification.valid) {
      return NextResponse.json({
        valid: false,
        reason: verification.reason || 'Invalid or expired token',
      });
    }

    // Check if user exists and get current preferences
    const db = await getDb();
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', verification.email).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({
        valid: false,
        reason: 'User not found',
      });
    }

    const userData = snapshot.docs[0].data();
    const alreadyUnsubscribed = userData.emailPreferences?.marketing === false;

    return NextResponse.json({
      valid: true,
      email: verification.email,
      alreadyUnsubscribed,
    });
  } catch (error: any) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to validate token' },
      { status: 500 }
    );
  }
}
