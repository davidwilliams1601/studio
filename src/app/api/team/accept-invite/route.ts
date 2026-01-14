import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { verifyIdToken } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/team/accept-invite - Accept team invitation and join team
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

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Invite token is required' }, { status: 400 });
    }

    const db = await getDb();

    // Find team with matching invite token
    const allTeamsSnapshot = await db.collection('teams').get();

    let foundTeam = null;
    let foundInvite = null;
    let teamDoc = null;

    for (const doc of allTeamsSnapshot.docs) {
      const teamData = doc.data();
      const invite = teamData.invites?.find((inv: any) => inv.token === token);

      if (invite) {
        foundTeam = { id: doc.id, ...teamData };
        foundInvite = invite;
        teamDoc = doc;
        break;
      }
    }

    if (!foundTeam || !foundInvite || !teamDoc) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
    }

    // Check if invite is still pending
    if (foundInvite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite has already been used' }, { status: 400 });
    }

    // Verify email matches (if email was specified in invite)
    if (foundInvite.email && userEmail && foundInvite.email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 403 }
      );
    }

    // Add user to team members
    const updatedMemberIds = [...(foundTeam.memberIds || []), userId];

    // Mark invite as accepted
    const updatedInvites = (foundTeam.invites || []).map((inv: any) =>
      inv.token === token ? { ...inv, status: 'accepted' } : inv
    );

    // Update team document
    await teamDoc.ref.update({
      memberIds: updatedMemberIds,
      invites: updatedInvites,
      updatedAt: new Date(),
    });

    // Update user document
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      teamId: foundTeam.id,
      tier: 'business', // Grant Business tier benefits
      teamJoinedAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ User ${userEmail} joined team ${foundTeam.id}`);

    return NextResponse.json({
      success: true,
      message: 'Successfully joined team',
      teamId: foundTeam.id,
    });
  } catch (error: any) {
    console.error('Accept invite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
