import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { verifyIdToken } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/team - Get current user's team information
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const db = await getDb();

    // Get user to check their team
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is part of a team
    if (userData.teamId) {
      const teamDoc = await db.collection('teams').doc(userData.teamId).get();
      if (teamDoc.exists) {
        const teamData = teamDoc.data();

        // Get team members details
        const memberPromises = teamData!.memberIds.map(async (memberId: string) => {
          const memberDoc = await db.collection('users').doc(memberId).get();
          const memberData = memberDoc.data();
          return {
            uid: memberId,
            email: memberData?.email,
            displayName: memberData?.displayName,
            role: memberId === teamData!.ownerId ? 'owner' : 'member',
            joinedAt: memberData?.teamJoinedAt || teamData!.createdAt,
          };
        });

        const members = await Promise.all(memberPromises);

        return NextResponse.json({
          success: true,
          team: {
            id: teamDoc.id,
            ...teamData,
            members,
          },
          isOwner: userData.teamId && teamData!.ownerId === userId,
        });
      }
    }

    // No team found
    return NextResponse.json({
      success: true,
      team: null,
      isOwner: false,
    });
  } catch (error: any) {
    console.error('Get team error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get team' },
      { status: 500 }
    );
  }
}
