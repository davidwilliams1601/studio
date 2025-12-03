import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, getDb } from '@/lib/firebase-admin';

/**
 * GET /api/gdpr/export-data
 *
 * GDPR Article 15: Right of Access
 * GDPR Article 20: Right to Data Portability
 *
 * Returns all user data in a structured JSON format
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authentication token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const db = await getDb();

    // Gather all user data
    const exportData: any = {
      exportDate: new Date().toISOString(),
      user: null,
      backups: [],
      snapshots: [],
      orgMemberships: [],
      metadata: {
        uid,
        email: decodedToken.email,
        requestIp: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      },
    };

    // Get user document
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      // Remove sensitive tokens from export
      if (userData?.linkedIn?.accessToken) {
        delete userData.linkedIn.accessToken;
      }
      if (userData?.linkedIn?.refreshToken) {
        delete userData.linkedIn.refreshToken;
      }
      exportData.user = userData;
    }

    // Get all backups
    const backupsSnapshot = await db
      .collection('backups')
      .where('uid', '==', uid)
      .get();

    backupsSnapshot.forEach((doc) => {
      const backup = doc.data();
      // Remove internal storage paths
      delete backup.storagePaths;
      exportData.backups.push(backup);
    });

    // Get all snapshots
    const snapshotsSnapshot = await db
      .collection('backupSnapshots')
      .doc(uid)
      .collection('snapshots')
      .get();

    snapshotsSnapshot.forEach((doc) => {
      exportData.snapshots.push(doc.data());
    });

    // Get org memberships
    const orgMembershipsSnapshot = await db
      .collection('orgMembers')
      .where('uid', '==', uid)
      .get();

    for (const doc of orgMembershipsSnapshot.docs) {
      const membership = doc.data();

      // Get org details
      const orgDoc = await db.collection('orgs').doc(membership.orgId).get();
      if (orgDoc.exists) {
        const orgData = orgDoc.data();
        // Remove billing info from export
        delete orgData?.billing;

        exportData.orgMemberships.push({
          membership,
          organization: orgData,
        });
      }
    }

    // Log the export request (for audit purposes)
    console.log(`GDPR data export request for user: ${uid} (${decodedToken.email})`);

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="linkstream-data-export-${Date.now()}.json"`,
      },
    });
  } catch (error: any) {
    console.error('GDPR export data error:', error);

    return NextResponse.json(
      { error: 'Failed to export data', details: error.message },
      { status: 500 }
    );
  }
}
