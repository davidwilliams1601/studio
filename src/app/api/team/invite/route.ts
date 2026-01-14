import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { verifyIdToken } from '@/lib/firebase-admin';
import { generateInviteToken, hasAvailableSeats, isValidEmail } from '@/lib/team-management';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/team/invite - Send team invitation
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    const { email } = await request.json();

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Prevent inviting yourself
    if (email.toLowerCase() === userEmail?.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot invite yourself' }, { status: 400 });
    }

    const db = await getDb();

    // Get user's team
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData || !userData.teamId) {
      return NextResponse.json({ error: 'You are not part of a team' }, { status: 400 });
    }

    const teamRef = db.collection('teams').doc(userData.teamId);
    const teamDoc = await teamRef.get();

    if (!teamDoc.exists) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const teamData = teamDoc.data()!;

    // Check if user is team owner
    if (teamData.ownerId !== userId) {
      return NextResponse.json({ error: 'Only team owner can send invites' }, { status: 403 });
    }

    // Check if team has available seats
    if (!hasAvailableSeats({ id: teamDoc.id, ...teamData } as any)) {
      return NextResponse.json(
        { error: 'No available seats. Maximum team size reached.' },
        { status: 400 }
      );
    }

    // Check if email is already a team member
    const existingMember = await db.collection('users')
      .where('email', '==', email.toLowerCase())
      .where('teamId', '==', userData.teamId)
      .limit(1)
      .get();

    if (!existingMember.empty) {
      return NextResponse.json({ error: 'User is already a team member' }, { status: 400 });
    }

    // Check if email already has a pending invite
    const existingInvite = teamData.invites?.find(
      (inv: any) => inv.email.toLowerCase() === email.toLowerCase() && inv.status === 'pending'
    );

    if (existingInvite) {
      return NextResponse.json({ error: 'Invite already sent to this email' }, { status: 400 });
    }

    // Generate invite token
    const token = generateInviteToken();

    // Add invite to team
    const newInvite = {
      email: email.toLowerCase(),
      token,
      status: 'pending',
      invitedAt: new Date(),
      invitedBy: userId,
    };

    await teamRef.update({
      invites: [...(teamData.invites || []), newInvite],
      updatedAt: new Date(),
    });

    // Send invite email
    try {
      const { EmailService } = await import('@/lib/email-service');
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup?team=${token}`;

      await EmailService.sendEmail({
        to: email,
        subject: `You've been invited to join ${userData.displayName || userEmail}'s team on LinkStream`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #3b82f6; color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
                .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none; }
                .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1 style="margin: 0;">🛡️ LinkStream</h1>
              </div>
              <div class="content">
                <h2>You've been invited to join a team!</h2>
                <p><strong>${userData.displayName || userEmail}</strong> has invited you to join their LinkStream Business team.</p>
                <p>With a team account, you'll get:</p>
                <ul>
                  <li>✓ Unlimited LinkedIn backups</li>
                  <li>✓ AI-powered insights</li>
                  <li>✓ Professional PDF reports</li>
                  <li>✓ Priority support</li>
                </ul>
                <p>Click the button below to accept the invitation and create your account:</p>
                <a href="${inviteUrl}" class="button">Accept Invitation</a>
                <p style="font-size: 12px; color: #6b7280;">Or copy this link: ${inviteUrl}</p>
              </div>
              <div class="footer">
                <p>This invitation was sent by ${userEmail}</p>
                <p>© ${new Date().getFullYear()} LinkStream. All rights reserved.</p>
              </div>
            </body>
          </html>
        `,
      });

      console.log(`✅ Team invite sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send invite email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      invite: newInvite,
    });
  } catch (error: any) {
    console.error('Team invite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
