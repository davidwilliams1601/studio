import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // For now, just log the welcome email
    // In production, you would integrate with an email service like SendGrid, Resend, etc.
    console.log(`📧 Welcome email would be sent to: ${email} (Name: ${name})`);

    // Simulate email sending
    const emailData = {
      to: email,
      subject: '🛡️ Welcome to LinkStream - Your LinkedIn is Now Protected!',
      template: 'welcome',
      data: {
        name: name || 'User',
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
      }
    };

    // TODO: Integrate with actual email service
    // Example with Resend:
    // const resend = new Resend(process.env.EMAIL_SERVICE_API_KEY);
    // await resend.emails.send(emailData);

    return NextResponse.json(
      {
        success: true,
        message: 'Welcome email sent successfully',
        // In development, return the email data for debugging
        ...(process.env.NODE_ENV === 'development' && { emailData })
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