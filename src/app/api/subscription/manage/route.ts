import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, getDb } from '@/lib/firebase-admin';
import { getCsrfTokens, verifyCsrfToken } from '@/lib/csrf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/subscription/manage
 *
 * Get subscription management details (portal URL)
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

    // Get user's Stripe customer ID
    const db = await getDb();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const customerId = userData?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json(
        {
          hasSubscription: false,
          message: 'No active subscription found',
        }
      );
    }

    // Create Stripe billing portal session
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: customerId,
        return_url: `${request.nextUrl.origin}/dashboard/subscription`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Stripe API error:', error);
      throw new Error(`Stripe API error: ${response.status}`);
    }

    const session = await response.json();

    return NextResponse.json({
      hasSubscription: true,
      portalUrl: session.url,
    });

  } catch (error: any) {
    console.error('Subscription management error:', error);
    return NextResponse.json(
      { error: 'Failed to create management session' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscription/manage
 *
 * Cancel subscription immediately
 */
export async function POST(request: NextRequest) {
  try {
    // Verify CSRF token
    const { headerToken, cookieToken } = getCsrfTokens(request);
    if (!verifyCsrfToken(headerToken, cookieToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

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
    const { action } = await request.json();

    const db = await getDb();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const subscriptionId = userData?.stripeSubscriptionId;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Handle different actions
    if (action === 'cancel') {
      // Cancel subscription immediately
      const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Stripe cancellation error:', error);
        throw new Error(`Failed to cancel subscription: ${response.status}`);
      }

      // Update Firestore (webhook will also update, but we do it here for immediate feedback)
      await userDoc.ref.update({
        tier: 'free',
        subscriptionStatus: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Subscription cancelled for user ${uid}`);

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled successfully',
      });

    } else if (action === 'cancel_at_period_end') {
      // Cancel at end of billing period
      const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          cancel_at_period_end: 'true',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Stripe update error:', error);
        throw new Error(`Failed to update subscription: ${response.status}`);
      }

      const subscription = await response.json();

      await userDoc.ref.update({
        subscriptionStatus: 'cancelling',
        cancelAtPeriodEnd: true,
        periodEndDate: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      });

      console.log(`✅ Subscription set to cancel at period end for user ${uid}`);

      return NextResponse.json({
        success: true,
        message: 'Subscription will be cancelled at the end of the billing period',
        periodEnd: subscription.current_period_end,
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Subscription management error:', error);
    return NextResponse.json(
      { error: 'Failed to manage subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscription/manage
 *
 * Reactivate a cancelled subscription
 */
export async function DELETE(request: NextRequest) {
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

    const db = await getDb();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const subscriptionId = userData?.stripeSubscriptionId;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Reactivate subscription (remove cancel_at_period_end)
    const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        cancel_at_period_end: 'false',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Stripe reactivation error:', error);
      throw new Error(`Failed to reactivate subscription: ${response.status}`);
    }

    await userDoc.ref.update({
      subscriptionStatus: 'active',
      cancelAtPeriodEnd: false,
      updatedAt: new Date(),
    });

    console.log(`✅ Subscription reactivated for user ${uid}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully',
    });

  } catch (error: any) {
    console.error('Subscription reactivation error:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    );
  }
}
