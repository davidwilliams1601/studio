import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, deleteUserData } from '@/lib/firebase-admin';

/**
 * POST /api/gdpr/delete-account
 *
 * GDPR Article 17: Right to Erasure ("Right to be Forgotten")
 * Permanently deletes all user data including:
 * - Firebase Auth account
 * - Firestore documents (user, backups, snapshots, org memberships)
 * - Storage files (uploaded ZIPs, processed data)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authentication token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get confirmation from request body
    const body = await request.json();
    const { confirmEmail, confirmation } = body;

    // Verify email matches
    if (confirmEmail !== decodedToken.email) {
      return NextResponse.json(
        { error: 'Email confirmation does not match' },
        { status: 400 }
      );
    }

    // Verify explicit confirmation
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Invalid confirmation text' },
        { status: 400 }
      );
    }

    // Log the deletion request (for audit purposes)
    console.log(`GDPR deletion request for user: ${uid} (${decodedToken.email})`);

    // Delete all user data
    await deleteUserData(uid);

    console.log(`Successfully deleted all data for user: ${uid}`);

    return NextResponse.json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted',
    });
  } catch (error: any) {
    console.error('GDPR delete account error:', error);

    return NextResponse.json(
      { error: 'Failed to delete account', details: error.message },
      { status: 500 }
    );
  }
}
