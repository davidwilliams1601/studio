import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log('🔍 Verifying Stripe session...');
  
  try {
    const body = await request.json();
    const { sessionId, userId } = body;

    if (!sessionId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing sessionId or userId' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    });

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('📋 Session status:', session.payment_status);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment not completed',
          paymentStatus: session.payment_status 
        },
        { status: 400 }
      );
    }

    // Extract subscription details from session metadata
    const plan = session.metadata?.plan || 'pro';
    const billingCycle = session.metadata?.billingCycle || 'monthly';

    // Update user subscription in Firestore
    try {
      const { SubscriptionService } = await import('@/services/subscriptionService');
      
      const subscriptionData = {
        plan: plan as 'pro',
        status: 'active' as const,
        stripeCustomerId: session.customer as string,
        sessionId: sessionId,
        upgradeDate: new Date().toISOString(),
        monthlyUsage: 0
      };

      await SubscriptionService.updateUserSubscription(userId, subscriptionData);
      console.log('✅ Subscription updated successfully');

      return NextResponse.json({
        success: true,
        subscription: subscriptionData,
        session: {
          id: session.id,
          paymentStatus: session.payment_status,
          amountTotal: session.amount_total,
          currency: session.currency
        }
      });

    } catch (dbError) {
      console.error('❌ Database update error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update subscription in database',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Session verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to verify session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
