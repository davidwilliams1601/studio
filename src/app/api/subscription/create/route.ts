import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { success: false, error: 'Price ID is required' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    console.log('Creating Stripe checkout for price:', priceId);

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'mode': 'subscription',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'success_url': `${request.nextUrl.origin}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${request.nextUrl.origin}/dashboard/subscription?canceled=true`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Stripe API error:', error);
      throw new Error(`Stripe API error: ${response.status}`);
    }

    const session = await response.json();
    console.log('Stripe checkout session created:', session.id);

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create subscription: ' + error.message 
      },
      { status: 500 }
    );
  }
}
