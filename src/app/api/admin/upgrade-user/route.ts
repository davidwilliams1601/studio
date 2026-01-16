import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { verifyAdminAccess, createAuditLog, validateReason } from '@/lib/admin-auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * ADMIN ENDPOINT - Manually upgrade a user tier
 * Now protected with admin authentication and audit logging
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await verifyAdminAccess(request);

    // Rate limiting
    const rateLimitResult = checkRateLimit(admin.uid, RATE_LIMITS.ADMIN_USER_MODIFY);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetAt: new Date(rateLimitResult.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    const { userId, tier, reason } = await request.json();

    if (!userId || !tier) {
      return NextResponse.json(
        { error: 'userId and tier required' },
        { status: 400 }
      );
    }

    // Validate reason
    const validatedReason = validateReason(reason);

    // Validate tier value
    const validTiers = ['free', 'pro', 'business', 'enterprise'];
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier value' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const userRef = db.collection('users').doc(userId);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const oldTier = userData?.tier || 'free';
    const userEmail = userData?.email || 'unknown';

    console.log(`Admin ${admin.email} upgrading user ${userId} from ${oldTier} to ${tier}`);
    console.log(`Reason: ${validatedReason}`);

    await userRef.update({
      tier,
      upgradeDate: new Date(),
      updatedAt: new Date(),
    });

    const updated = await userRef.get();
    const newTier = updated.data()?.tier;
    console.log(`Updated tier: ${newTier}`);

    // Create audit log
    await createAuditLog({
      adminUid: admin.uid,
      adminEmail: admin.email,
      action: 'tier_change',
      targetUid: userId,
      targetEmail: userEmail,
      reason: validatedReason,
      metadata: {
        oldTier,
        newTier,
      },
    });

    return NextResponse.json({
      success: true,
      userId,
      oldTier,
      newTier,
    });

  } catch (error: any) {
    console.error('Upgrade error:', error);

    // Determine if this is an auth error or server error
    const isAuthError = error.message?.includes('Admin access') || error.message?.includes('token');
    const statusCode = isAuthError ? 403 : 500;

    return NextResponse.json(
      { error: error.message || 'Failed to upgrade user' },
      { status: statusCode }
    );
  }
}
