import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time import of Resend
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Lazy import to avoid build-time evaluation
  const { EmailService } = await import('@/lib/email-service');
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Send welcome email using Resend
    const result = await EmailService.sendWelcomeEmail(email, name);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Failed to send welcome email',
          // In development, still return success if email service not configured
          ...(process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY && {
            success: true,
            warning: 'Email service not configured in development mode'
          })
        },
        { status: process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY ? 200 : 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Welcome email sent successfully',
        ...(result.id && { emailId: result.id }),
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}