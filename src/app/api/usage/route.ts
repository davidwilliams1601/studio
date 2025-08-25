import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/firebase-admin';
import { recordBackupUsage } from '@/lib/usage';

export async function POST(request: NextRequest) {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    let user;
    try {
      const auth = await getAuth();
      user = await auth.verifyIdToken(token);
    } catch (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Record the backup usage for this user
    await recordBackupUsage(user.uid);

    return NextResponse.json({
      success: true,
      message: 'Usage recorded successfully'
    });

  } catch (error) {
    console.error('Usage recording error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to record usage: ' + errorMessage },
      { status: 500 }
    );
  }
}
