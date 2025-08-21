import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log('🚀 API Route called - subscription/create');
  
  try {
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const { plan, userId, userEmail, billingCycle = 'monthly' } = body;

    if (!plan || !userId || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields', details: { plan, userId, userEmail } },
        { status: 400 }
      );
    }

    console.log('🔑 Environment check...');
    const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
    console.log('STRIPE_SECRET_KEY exists:', hasStripeKey);
    
    if (!hasStripeKey) {
      return NextResponse.json(
        { success: false, error: 'Stripe not configured - missing secret key' },
        { status: 500 }
      );
    }

    console.log('📦 Importing Stripe...');
    let stripe;
    try {
      const Stripe = (await import('stripe')).default;
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2024-06-20',
      });
      console.log('✅ Stripe initialized');
    } catch (stripeError) {
      console.error('❌ Stripe error:', stripeError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Stripe initialization failed', 
          details: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
        },
        { status: 500 }
      );
    }

    const priceIds = {
      pro: {
        monthly: 'price_1RrErpIpQXRH010BG7mAhEqD',
        yearly: 'price_1RyUJ3IpQXRH010BaBtR4LCE'
      }
    };

    const priceId = priceIds[plan as keyof typeof priceIds]?.[billingCycle as keyof typeof priceIds.pro];

    if (!priceId) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan configuration', details: { plan, billingCycle, availablePlans: Object.keys(priceIds) } },
        { status: 400 }
      );
    }

    console.log('🏪 Creating Stripe session with price:', priceId);
    
    // Get the current domain dynamically to handle different environments
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = request.headers.get('host') || 'www.lstream.app';
    const baseUrl = `${protocol}://${host}`;
    
    // Properly encode URL parameters to prevent invalid characters
    const encodedPlan = encodeURIComponent(plan);
    const encodedUserId = encodeURIComponent(userId);
    
    // Construct URLs with proper encoding
    const successUrl = `${baseUrl}/dashboard/success?session_id={CHECKOUT_SESSION_ID}&plan=${encodedPlan}&user_id=${encodedUserId}`;
    const cancelUrl = `${baseUrl}/dashboard/subscription?canceled=true`;
    
    console.log('🔗 URLs being used:');
    console.log('Success URL:', successUrl);
    console.log('Cancel URL:', cancelUrl);
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      metadata: { userId, plan, billingCycle },
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    console.log('✅ Session created:', session.id);

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('❌ Complete error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // If it's a Stripe error, log more details
    if (error && typeof error === 'object' && 'type' in error) {
      console.error('🔴 Stripe checkout error:', error);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create checkout session',
        errorType: error instanceof Error ? error.name : 'Unknown',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
