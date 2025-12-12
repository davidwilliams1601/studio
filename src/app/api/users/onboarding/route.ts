import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, getDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/users/onboarding
 * Mark user onboarding as complete
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const { completed } = await request.json();

    // Update user document in Firestore
    const db = await getDb();
    await db.collection('users').doc(uid).set(
      {
        hasCompletedOnboarding: completed === true,
        onboardingCompletedAt: completed === true ? new Date() : null,
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Onboarding update error:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding status' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/onboarding
 * Check if user has completed onboarding
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get user document from Firestore
    const db = await getDb();
    const userDoc = await db.collection('users').doc(uid).get();

    const hasCompletedOnboarding = userDoc.exists
      ? userDoc.data()?.hasCompletedOnboarding || false
      : false;

    return NextResponse.json({
      hasCompletedOnboarding,
      isNewUser: !userDoc.exists,
    });
  } catch (error: any) {
    console.error('Onboarding check error:', error);
    return NextResponse.json(
      { error: 'Failed to check onboarding status' },
      { status: 500 }
    );
  }
}
