import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * DEBUG ENDPOINT - Test email sending
 */
export async function GET(request: NextRequest) {
  const { EmailService } = await import('@/lib/email-service');

  try {
    const hasApiKey = !!process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || 'LinkStream <onboarding@resend.dev>';

    // Try to send a test email
    const testEmail = 'test@example.com';
    const result = await EmailService.sendEmail({
      to: testEmail,
      subject: 'Test Email',
      html: '<p>This is a test email from LinkStream</p>',
    });

    return NextResponse.json({
      hasApiKey,
      emailFrom,
      apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
      testResult: result,
      note: 'Check if EMAIL_FROM is using verified domain'
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      hasApiKey: !!process.env.RESEND_API_KEY,
      emailFrom: process.env.EMAIL_FROM || 'LinkStream <onboarding@resend.dev>',
    }, { status: 500 });
  }
}
