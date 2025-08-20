import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Stripe API error: ${response.status}`);
    }

    const session = await response.json();
    console.log('Stripe session details:', session);

    if (session.payment_status === 'paid') {
      console.log('Payment successful for session:', sessionId);
      
      return NextResponse.json({
        success: true,
        plan: 'pro',
        customer: session.customer_details,
        amount: session.amount_total,
        currency: session.currency,
        customerId: session.customer,
        sessionId: sessionId
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Payment not completed',
        status: session.payment_status
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Verification failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}
