import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, getDb } from '@/lib/firebase-admin';
import { EmailService } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

/**
 * TEST ENDPOINT - Manually send welcome email
 * Use this to test the welcome email or resend to existing users
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get user data from Firestore
    const db = await getDb();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const email = userData?.email || decodedToken.email;
    const displayName = userData?.displayName;
    const tier = userData?.tier || 'free';

    if (!email) {
      return NextResponse.json(
        { error: 'No email address found' },
        { status: 400 }
      );
    }

    console.log(`📧 Sending welcome email to ${email} (tier: ${tier})`);

    let emailResult;

    // Send appropriate email based on tier
    if (tier === 'free') {
      emailResult = await EmailService.sendWelcomeEmail(email, displayName);
    } else {
      emailResult = await EmailService.sendUpgradeWelcomeEmail(email, tier, displayName);
    }

    if (emailResult.success) {
      console.log('✅ Email sent successfully:', emailResult.id);
      return NextResponse.json({
        success: true,
        message: 'Welcome email sent successfully',
        emailId: emailResult.id,
        recipient: email,
        tier
      });
    } else {
      console.error('❌ Email send failed:', emailResult.error);
      return NextResponse.json({
        success: false,
        error: emailResult.error || 'Failed to send email'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send email'
    }, { status: 500 });
  }
}
