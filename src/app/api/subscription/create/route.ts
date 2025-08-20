import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, userId, userEmail } = body;

    console.log('🚀 Creating Stripe checkout for:', { plan, userId, userEmail });

    // For demo purposes, we'll simulate a successful payment
    // In production, you'd use the real Stripe API here
    
    const mockStripeSession = {
      id: `cs_${Date.now()}`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://linkstream-efh3pmobr-davidwilliams1601s-projects.vercel.app'}/dashboard/success?session_id=cs_${Date.now()}&plan=${plan}&user_id=${userId}`
    };

    console.log('✅ Mock Stripe session created:', mockStripeSession);

    return NextResponse.json({
      success: true,
      url: mockStripeSession.url,
      sessionId: mockStripeSession.id
    });
  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
