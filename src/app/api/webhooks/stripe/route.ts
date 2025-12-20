import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

export const runtime = 'nodejs';

/**
 * Stripe Webhook Handler
 *
 * Handles subscription lifecycle events from Stripe:
 * - checkout.session.completed: When payment succeeds
 * - customer.subscription.updated: When subscription changes
 * - customer.subscription.deleted: When subscription is cancelled
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ No Stripe signature found');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const event = await verifyStripeWebhook(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    if (!event) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`📥 Stripe webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Verify Stripe webhook signature
 */
async function verifyStripeWebhook(
  payload: string,
  signature: string,
  secret: string
): Promise<any | null> {
  try {
    // Parse the signature header
    const signatureParts = signature.split(',').reduce((acc: any, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {});

    const timestamp = signatureParts.t;
    const signatures = [signatureParts.v1];

    // Create the signed payload
    const signedPayload = `${timestamp}.${payload}`;

    // Compute HMAC
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    // Verify signature
    const isValid = signatures.some((sig: string) =>
      crypto.timingSafeEqual(
        Buffer.from(sig),
        Buffer.from(expectedSignature)
      )
    );

    if (!isValid) {
      console.error('❌ Invalid webhook signature');
      return null;
    }

    // Check timestamp (prevent replay attacks)
    const currentTime = Math.floor(Date.now() / 1000);
    const timestampAge = currentTime - parseInt(timestamp);

    if (timestampAge > 300) { // 5 minutes
      console.error('❌ Webhook timestamp too old');
      return null;
    }

    return JSON.parse(payload);

  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return null;
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session: any) {
  const userId = session.client_reference_id || session.metadata?.userId;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  if (!userId) {
    console.error('❌ No user ID in checkout session');
    return;
  }

  console.log(`✅ Checkout completed for user: ${userId}`);
  console.log(`📋 Session details:`, {
    amount: session.amount_total,
    priceId: session.metadata?.priceId,
    customerId,
    subscriptionId
  });

  // Determine tier from price ID
  const tier = await getTierFromSession(session);
  console.log(`🎯 Determined tier: ${tier}`);

  const db = await getDb();
  const userRef = db.collection('users').doc(userId);

  // Use set with merge to create document if it doesn't exist
  await userRef.set({
    tier,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    upgradeDate: new Date(),
    updatedAt: new Date(),
  }, { merge: true });

  console.log(`✅ User ${userId} upgraded to ${tier} tier and saved to Firestore`);

  // Verify it was saved
  const updatedDoc = await userRef.get();
  console.log(`🔍 Verification - User tier in Firestore: ${updatedDoc.data()?.tier}`);
}

/**
 * Handle subscription update (tier change, renewal, etc.)
 */
async function handleSubscriptionUpdated(subscription: any) {
  const customerId = subscription.customer;

  // Find user by Stripe customer ID
  const db = await getDb();
  const usersRef = db.collection('users');
  const snapshot = await usersRef
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.error(`❌ No user found for customer: ${customerId}`);
    return;
  }

  const userDoc = snapshot.docs[0];
  const userId = userDoc.id;

  // Determine new tier
  const tier = getTierFromSubscription(subscription);

  await userDoc.ref.set({
    tier,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    updatedAt: new Date(),
  }, { merge: true });

  console.log(`✅ Subscription updated for user ${userId}: ${tier} (${subscription.status})`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: any) {
  const customerId = subscription.customer;

  const db = await getDb();
  const usersRef = db.collection('users');
  const snapshot = await usersRef
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.error(`❌ No user found for customer: ${customerId}`);
    return;
  }

  const userDoc = snapshot.docs[0];
  const userId = userDoc.id;

  // Downgrade to free tier
  await userDoc.ref.set({
    tier: 'free',
    subscriptionStatus: 'cancelled',
    cancelledAt: new Date(),
    updatedAt: new Date(),
  }, { merge: true });

  console.log(`✅ Subscription cancelled for user ${userId}, downgraded to free`);
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: any) {
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  console.log(`✅ Payment succeeded for customer: ${customerId}`);

  // Update payment status if needed
  const db = await getDb();
  const usersRef = db.collection('users');
  const snapshot = await usersRef
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    await userDoc.ref.set({
      lastPaymentDate: new Date(),
      subscriptionStatus: 'active',
      updatedAt: new Date(),
    }, { merge: true });
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: any) {
  const customerId = invoice.customer;

  console.error(`❌ Payment failed for customer: ${customerId}`);

  // Update payment status
  const db = await getDb();
  const usersRef = db.collection('users');
  const snapshot = await usersRef
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    await userDoc.ref.set({
      subscriptionStatus: 'past_due',
      lastPaymentFailed: new Date(),
      updatedAt: new Date(),
    }, { merge: true });
  }
}

/**
 * Get tier from checkout session
 */
async function getTierFromSession(session: any): Promise<'free' | 'pro' | 'business' | 'enterprise'> {
  // FIRST: Check price ID in metadata (most reliable)
  const priceId = session.metadata?.priceId;

  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro';
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return 'business';
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) return 'enterprise';

  // FALLBACK: Check amount if price ID not in metadata
  if (session.amount_total) {
    const amount = session.amount_total / 100; // Convert from cents

    if (amount >= 99) return 'enterprise';
    if (amount >= 29) return 'business';
    if (amount >= 10) return 'pro';
  }

  return 'free';
}

/**
 * Get tier from subscription object
 */
function getTierFromSubscription(subscription: any): 'free' | 'pro' | 'business' | 'enterprise' {
  const priceId = subscription.items?.data[0]?.price?.id;

  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro';
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return 'business';
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) return 'enterprise';

  // Fallback to amount
  const amount = subscription.items?.data[0]?.price?.unit_amount / 100;

  if (amount >= 99) return 'enterprise';
  if (amount >= 29) return 'business';
  if (amount >= 10) return 'pro';

  return 'free';
}
