import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, getDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/subscription/status
 *
 * Returns the user's current subscription status
 * Server-side validation prevents client-side tampering
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
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;

    // Fetch user data from Firestore
    const db = await getDb();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Calculate current month usage
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get backups created this month
    const backupsSnapshot = await db
      .collection('backups')
      .where('uid', '==', uid)
      .where('createdAt', '>=', monthStart)
      .get();

    const monthlyUsage = backupsSnapshot.size;

    // Return subscription status
    return NextResponse.json({
      plan: userData?.tier || 'free',
      monthlyUsage,
      upgradeDate: userData?.upgradeDate || null,
      backupsThisMonth: userData?.backupsThisMonth || 0,
      lastBackupDate: userData?.lastBackupDate || null,
    });
  } catch (error: any) {
    console.error('Subscription status error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}
