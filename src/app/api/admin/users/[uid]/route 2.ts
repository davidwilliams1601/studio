import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { verifyAdminAccess, createAuditLog, validateReason } from '@/lib/admin-auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import {
  cancelStripeSubscription,
  getSubscriptionDetails,
} from '@/lib/stripe-admin';

export const dynamic = 'force-dynamic';

/**
 * GET - Fetch detailed user information including Stripe subscription
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const admin = await verifyAdminAccess(request);

    const rateLimitResult = checkRateLimit(admin.uid, RATE_LIMITS.ADMIN_USERS_LIST);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetAt: new Date(rateLimitResult.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    const { uid } = params;
    const db = await getDb();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const user = {
      uid: userDoc.id,
      email: userData?.email || '',
      displayName: userData?.displayName || '',
      tier: userData?.tier || 'free',
      subscriptionStatus: userData?.subscriptionStatus || 'active',
      createdAt: userData?.createdAt?.toDate?.() || new Date(),
      upgradeDate: userData?.upgradeDate?.toDate?.() || null,
      cancelledAt: userData?.cancelledAt?.toDate?.() || null,
      stripeCustomerId: userData?.stripeCustomerId || null,
      stripeSubscriptionId: userData?.stripeSubscriptionId || null,
      hasCompletedOnboarding: userData?.hasCompletedOnboarding || false,
      backupsThisMonth: userData?.backupsThisMonth || 0,
      lastBackupDate: userData?.lastBackupDate?.toDate?.() || null,
    };

    // Fetch Stripe subscription if exists
    let subscription = null;
    if (user.stripeSubscriptionId) {
      try {
        subscription = await getSubscriptionDetails(user.stripeSubscriptionId);
      } catch (error) {
        console.error('Failed to fetch Stripe subscription:', error);
        // Continue without subscription data
      }
    }

    console.log(`📊 Admin ${admin.email} viewed user ${user.email}`);

    return NextResponse.json({ user, subscription });
  } catch (error: any) {
    console.error('Get user endpoint error:', error);

    const isAuthError =
      error.message?.includes('Admin access') ||
      error.message?.includes('token');
    const statusCode = isAuthError ? 403 : 500;

    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: statusCode }
    );
  }
}

/**
 * PATCH - Update user (cancel subscription)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const admin = await verifyAdminAccess(request);

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

    const { uid } = params;
    const body = await request.json();
    const { action, immediate, reason } = body;

    if (action !== 'cancel_subscription') {
      return NextResponse.json(
        { error: 'Invalid action. Only cancel_subscription is supported.' },
        { status: 400 }
      );
    }

    const validatedReason = validateReason(reason);

    const db = await getDb();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const userEmail = userData?.email || 'unknown';
    const stripeSubscriptionId = userData?.stripeSubscriptionId;

    if (!stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'User does not have an active subscription' },
        { status: 400 }
      );
    }

    console.log(`Admin ${admin.email} cancelling subscription for ${userEmail} (immediate: ${immediate})`);
    console.log(`Reason: ${validatedReason}`);

    // Cancel Stripe subscription
    const cancelledSubscription = await cancelStripeSubscription(
      stripeSubscriptionId,
      immediate
    );

    // Update Firestore
    await db.collection('users').doc(uid).update({
      subscriptionStatus: immediate ? 'cancelled' : 'cancelling',
      cancelledAt: new Date(),
      updatedAt: new Date(),
    });

    // Create audit log
    await createAuditLog({
      adminUid: admin.uid,
      adminEmail: admin.email,
      action: 'subscription_cancel',
      targetUid: uid,
      targetEmail: userEmail,
      reason: validatedReason,
      metadata: {
        immediate,
        subscriptionId: stripeSubscriptionId,
      },
    });

    return NextResponse.json({
      success: true,
      message: immediate
        ? 'Subscription cancelled immediately'
        : 'Subscription will be cancelled at period end',
      subscription: cancelledSubscription,
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);

    const isAuthError =
      error.message?.includes('Admin access') ||
      error.message?.includes('token');
    const statusCode = isAuthError ? 403 : 500;

    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: statusCode }
    );
  }
}

/**
 * DELETE - Delete user account
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const admin = await verifyAdminAccess(request);

    const rateLimitResult = checkRateLimit(admin.uid, RATE_LIMITS.ADMIN_DELETE_USER);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetAt: new Date(rateLimitResult.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    const { uid } = params;
    const body = await request.json();
    const { confirmEmail, reason } = body;

    const validatedReason = validateReason(reason);

    const db = await getDb();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const userEmail = userData?.email || '';

    // Verify email confirmation
    if (confirmEmail !== userEmail) {
      return NextResponse.json(
        { error: 'Email confirmation does not match. Please enter the exact email address.' },
        { status: 400 }
      );
    }

    console.log(`Admin ${admin.email} deleting user ${userEmail}`);
    console.log(`Reason: ${validatedReason}`);

    // Cancel Stripe subscription if exists
    const stripeSubscriptionId = userData?.stripeSubscriptionId;
    if (stripeSubscriptionId) {
      try {
        await cancelStripeSubscription(stripeSubscriptionId, true);
        console.log(`Cancelled Stripe subscription ${stripeSubscriptionId}`);
      } catch (error) {
        console.error('Failed to cancel Stripe subscription during deletion:', error);
        // Continue with deletion anyway
      }
    }

    // Delete Firestore user document
    await db.collection('users').doc(uid).delete();
    console.log(`Deleted user document ${uid}`);

    // Create audit log
    await createAuditLog({
      adminUid: admin.uid,
      adminEmail: admin.email,
      action: 'user_delete',
      targetUid: uid,
      targetEmail: userEmail,
      reason: validatedReason,
      metadata: {
        hadSubscription: !!stripeSubscriptionId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User account deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);

    const isAuthError =
      error.message?.includes('Admin access') ||
      error.message?.includes('token');
    const statusCode = isAuthError ? 403 : 500;

    // Try to log failed deletion
    try {
      const admin = await verifyAdminAccess(request);
      await createAuditLog({
        adminUid: admin.uid,
        adminEmail: admin.email,
        action: 'user_delete_failed',
        targetUid: params.uid,
        targetEmail: 'unknown',
        reason: `Delete failed: ${error.message}`,
        metadata: {
          error: error.message,
        },
      });
    } catch {
      // Ignore audit log errors
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: statusCode }
    );
  }
}
