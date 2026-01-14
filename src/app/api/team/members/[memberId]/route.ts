import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { verifyIdToken } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * DELETE /api/team/members/[memberId] - Remove team member or cancel invite
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const { memberId } = params;

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Only team owner can remove members' }, { status: 403 });
    }

    // Prevent owner from removing themselves
    if (memberId === userId) {
      return NextResponse.json({ error: 'Cannot remove yourself as owner' }, { status: 400 });
    }

    // Check if this is a member ID or invite email/token
    const isInviteToken = !memberId.includes('@') && memberId.length > 20;
    const isEmail = memberId.includes('@');

    if (isInviteToken || isEmail) {
      // Remove pending invite
      const updatedInvites = (teamData.invites || []).filter((inv: any) => {
        if (isInviteToken) {
          return inv.token !== memberId;
        } else {
          return inv.email !== memberId.toLowerCase();
        }
      });

      await teamRef.update({
        invites: updatedInvites,
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Invitation cancelled',
      });
    } else {
      // Remove team member
      if (!teamData.memberIds.includes(memberId)) {
        return NextResponse.json({ error: 'User is not a team member' }, { status: 404 });
      }

      // Remove from team members list
      const updatedMemberIds = teamData.memberIds.filter((id: string) => id !== memberId);

      await teamRef.update({
        memberIds: updatedMemberIds,
        updatedAt: new Date(),
      });

      // Update removed member's user document
      const memberRef = db.collection('users').doc(memberId);
      await memberRef.update({
        teamId: null,
        tier: 'free', // Revert to free tier
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Member removed from team',
      });
    }
  } catch (error: any) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove member' },
      { status: 500 }
    );
  }
}
