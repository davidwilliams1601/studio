import { NextRequest, NextResponse } from "next/server";

// Simple subscription email without complex service for now
export async function POST(request: NextRequest) {
  try {
    const { email, name, plan, amount } = await request.json();

    if (!email || !name || !plan || !amount) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    console.log('📧 Subscription email for:', email, 'plan:', plan);

    // For now, just log - we'll implement the actual email later
    console.log('✅ Subscription email would be sent to:', email);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error in subscription email API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
