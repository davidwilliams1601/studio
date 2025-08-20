import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/services/emailService";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('🧪 Testing email for:', email);
    console.log('🔑 API Key present:', !!process.env.RESEND_API_KEY);

    const result = await EmailService.testEmail(email);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error in test email API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
