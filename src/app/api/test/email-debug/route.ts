import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * DEBUG ENDPOINT - Check email service configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Check if authenticated (optional for debug)
    const authHeader = request.headers.get('authorization');
    let isAuthenticated = false;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const idToken = authHeader.split('Bearer ')[1];
        await verifyIdToken(idToken);
        isAuthenticated = true;
      } catch (e) {
        // Not authenticated, that's ok for debug
      }
    }

    // Check environment variables
    const hasResendKey = !!process.env.RESEND_API_KEY;
    const resendKeyLength = process.env.RESEND_API_KEY?.length || 0;
    const resendKeyPrefix = process.env.RESEND_API_KEY?.substring(0, 7) || '';
    const emailFrom = process.env.EMAIL_FROM || 'LinkStream <onboarding@resend.dev>';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://linkstream.app';

    // Try to initialize Resend
    let resendInitialized = false;
    let resendError = null;

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      resendInitialized = true;

      // Try to send a test email if authenticated
      if (isAuthenticated) {
        try {
          const { data, error } = await resend.emails.send({
            from: emailFrom,
            to: 'test@example.com', // This won't actually send
            subject: 'Test Email',
            html: '<p>Test</p>',
          });

          if (error) {
            resendError = error.message;
          }
        } catch (sendError: any) {
          resendError = sendError.message;
        }
      }
    } catch (error: any) {
      resendError = error.message;
    }

    return NextResponse.json({
      emailServiceConfig: {
        hasResendKey,
        resendKeyLength,
        resendKeyPrefix,
        emailFrom,
        appUrl,
        resendInitialized,
        resendError,
      },
      isAuthenticated,
      note: 'Test email only attempts to send if authenticated'
    });

  } catch (error: any) {
    console.error('❌ Email debug error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
