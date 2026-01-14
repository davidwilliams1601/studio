import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/team/validate-invite/[token] - Validate team invite token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const db = await getDb();

    // Find team with matching invite token
    const teamsSnapshot = await db.collection('teams')
      .where('invites', 'array-contains-any', [{ token }])
      .limit(1)
      .get();

    if (teamsSnapshot.empty) {
      // Try a more comprehensive search
      const allTeamsSnapshot = await db.collection('teams').get();

      let foundTeam: any = null;
      let foundInvite: any = null;

      for (const teamDoc of allTeamsSnapshot.docs) {
        const teamData = teamDoc.data();
        const invite = teamData.invites?.find((inv: any) => inv.token === token);

        if (invite) {
          foundTeam = { id: teamDoc.id, ...teamData };
          foundInvite = invite;
          break;
        }
      }

      if (!foundTeam || !foundInvite) {
        return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
      }

      // Check if invite is still pending
      if (foundInvite.status !== 'pending') {
        return NextResponse.json({ error: 'Invite has already been used' }, { status: 400 });
      }

      // Get team owner details
      const ownerDoc = await db.collection('users').doc(foundTeam.ownerId).get();
      const ownerData = ownerDoc.data();

      return NextResponse.json({
        success: true,
        valid: true,
        invite: foundInvite,
        team: {
          id: foundTeam.id,
          ownerName: ownerData?.displayName || ownerData?.email || 'Team Owner',
          ownerEmail: ownerData?.email,
        },
      });
    }

    const teamDoc = teamsSnapshot.docs[0];
    const teamData = teamDoc.data();

    // Find the specific invite
    const invite = teamData.invites?.find((inv: any) => inv.token === token);

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if invite is still pending
    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite has already been used' }, { status: 400 });
    }

    // Get team owner details
    const ownerDoc = await db.collection('users').doc(teamData.ownerId).get();
    const ownerData = ownerDoc.data();

    return NextResponse.json({
      success: true,
      valid: true,
      invite,
      team: {
        id: teamDoc.id,
        ownerName: ownerData?.displayName || ownerData?.email || 'Team Owner',
        ownerEmail: ownerData?.email,
      },
    });
  } catch (error: any) {
    console.error('Validate invite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to validate invite' },
      { status: 500 }
    );
  }
}
