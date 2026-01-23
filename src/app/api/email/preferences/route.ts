// src/app/api/email/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, getDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Get email preferences for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);

    const db = await getDb();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const emailPreferences = userData?.emailPreferences || {};

    // Default to true if not explicitly set (existing users)
    const marketing = emailPreferences.marketing !== undefined ? emailPreferences.marketing : true;

    return NextResponse.json({
      marketing,
      unsubscribedAt: emailPreferences.unsubscribedAt,
    });
  } catch (error: any) {
    console.error('Get email preferences error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

/**
 * Update email preferences for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);

    const { marketing } = await request.json();

    if (typeof marketing !== 'boolean') {
      return NextResponse.json(
        { error: 'Marketing preference must be a boolean' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const updateData: any = {
      'emailPreferences.marketing': marketing,
      'emailPreferences.updatedAt': new Date(),
    };

    // If re-subscribing, remove the unsubscribedAt timestamp
    if (marketing) {
      updateData['emailPreferences.unsubscribedAt'] = null;
    } else {
      updateData['emailPreferences.unsubscribedAt'] = new Date();
    }

    await db.collection('users').doc(decodedToken.uid).update(updateData);

    console.log(`✅ User ${decodedToken.email} updated marketing emails to: ${marketing}`);

    return NextResponse.json({
      success: true,
      message: 'Email preferences updated',
      marketing,
    });
  } catch (error: any) {
    console.error('Update email preferences error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
