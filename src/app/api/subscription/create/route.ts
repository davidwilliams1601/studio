import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase-admin";
import { checkRateLimit, getRequestIdentifier, RATE_LIMITS } from "@/lib/rate-limit";
import { getCsrfTokens, verifyCsrfToken } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Step 1: Verifying CSRF token...');
    // Verify CSRF token
    const { headerToken, cookieToken } = getCsrfTokens(request);
    if (!verifyCsrfToken(headerToken, cookieToken)) {
      console.log('❌ CSRF token verification failed');
      return NextResponse.json(
        { success: false, error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
    console.log('✅ CSRF token verified');

    console.log('🔍 Step 2: Verifying authentication...');
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ No authorization header');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(idToken);
      console.log('✅ Authentication verified for user:', decodedToken.uid);
    } catch (error) {
      console.log('❌ Authentication verification failed:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    console.log('🔍 Step 3: Checking rate limits...');
    // Apply rate limiting
    const identifier = getRequestIdentifier(request, decodedToken.uid);
    const rateLimit = checkRateLimit(identifier, RATE_LIMITS.STRIPE_CHECKOUT);

    if (!rateLimit.allowed) {
      console.log('❌ Rate limit exceeded');
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          },
        }
      );
    }
    console.log('✅ Rate limit check passed');

    console.log('🔍 Step 4: Parsing request body...');
    const { priceId } = await request.json();
    console.log('✅ Request body parsed, priceId:', priceId);

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

    console.log('Creating Stripe checkout for user:', decodedToken.uid, 'price:', priceId);
    console.log('🔑 Stripe API Key (last 10 chars):', process.env.STRIPE_SECRET_KEY?.slice(-10));
    console.log('🔑 Stripe API Key (first 7 chars):', process.env.STRIPE_SECRET_KEY?.slice(0, 7));

    const requestBody = new URLSearchParams({
      'payment_method_types[]': 'card',
      'mode': 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'success_url': `${request.nextUrl.origin}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': `${request.nextUrl.origin}/dashboard/subscription?canceled=true`,
      'client_reference_id': decodedToken.uid,
      'customer_email': decodedToken.email || '',
      'metadata[userId]': decodedToken.uid,
      'metadata[priceId]': priceId,
    });

    console.log('📤 Stripe request body:', requestBody.toString());

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });

    console.log('📥 Stripe API response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Stripe API error response:', error);
      throw new Error(`Stripe API error: ${response.status} - ${error}`);
    }

    const session = await response.json();
    console.log('Stripe checkout session created:', session.id);

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error: any) {
    console.error('❌ Error creating subscription:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);

    // Return more detailed error for debugging (temporarily)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create subscription. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
