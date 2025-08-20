import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/services/emailService";

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Welcome email API called');
    
    const body = await request.json();
    const { email, name } = body;

    console.log('📧 Request body:', { email, name });
    console.log('🔑 Environment variables check:');
    console.log('  - RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('  - RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);
    console.log('  - RESEND_API_KEY preview:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');

    if (!email || !name) {
      console.error('❌ Missing email or name in request');
      return NextResponse.json(
        { success: false, error: 'Email and name are required', received: { email, name } },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY environment variable not set');
      return NextResponse.json(
        { success: false, error: 'Email service not configured - API key missing' },
        { status: 500 }
      );
    }

    console.log('🔄 Calling EmailService.sendWelcomeEmail...');
    const success = await EmailService.sendWelcomeEmail({ email, name });

    if (success) {
      console.log('✅ Welcome email sent successfully');
      return NextResponse.json({ success: true, message: 'Welcome email sent successfully' });
    } else {
      console.error('❌ EmailService returned false');
      return NextResponse.json(
        { success: false, error: 'Failed to send welcome email - service returned false' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Exception in welcome email API:');
    console.error('  - Error type:', typeof error);
    console.error('  - Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('  - Stack trace:', error instanceof Error ? error.stack : 'No stack');
    console.error('  - Full error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error in welcome email API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
