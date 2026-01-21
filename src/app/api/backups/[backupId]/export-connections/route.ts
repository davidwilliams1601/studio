import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, getDb, getStorageBucket } from '@/lib/firebase-admin';
import JSZip from 'jszip';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/backups/[backupId]/export-connections
 *
 * Exports connections from a backup as CSV file
 * - Retrieves the raw LinkedIn export ZIP from storage
 * - Extracts Connections.csv
 * - Returns as downloadable CSV
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { backupId: string } }
) {
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
    const userId = decodedToken.uid;

    const backupId = params.backupId;

    // Get backup document from Firestore
    const db = await getDb();
    const backupDoc = await db.collection('backups').doc(backupId).get();

    if (!backupDoc.exists) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      );
    }

    const backup = backupDoc.data();

    // Verify ownership
    if (backup?.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to backup' },
        { status: 403 }
      );
    }

    // Get storage path for raw ZIP
    const storagePath = backup?.storagePaths?.raw;
    if (!storagePath) {
      return NextResponse.json(
        { error: 'Raw backup file not found' },
        { status: 404 }
      );
    }

    console.log(`📦 Retrieving backup from storage: ${storagePath}`);

    // Download ZIP from Firebase Storage
    const bucket = getStorageBucket();
    const file = bucket.file(storagePath);

    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json(
        { error: 'Backup file no longer exists in storage' },
        { status: 404 }
      );
    }

    const [zipBuffer] = await file.download();

    // Parse ZIP
    const zip = await JSZip.loadAsync(zipBuffer);

    // Find Connections.csv (case-insensitive)
    let connectionsFile = null;
    let connectionsFileName = '';

    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.toLowerCase().includes('connections.csv') && !file.dir) {
        connectionsFile = file;
        connectionsFileName = filename;
        break;
      }
    }

    if (!connectionsFile) {
      return NextResponse.json(
        { error: 'Connections.csv not found in backup' },
        { status: 404 }
      );
    }

    console.log(`📄 Found connections file: ${connectionsFileName}`);

    // Extract CSV content
    const csvContent = await connectionsFile.async('text');

    console.log(`✅ Exporting ${csvContent.split('\n').length - 1} connections`);

    // Return CSV as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="linkedin-connections-${backupId}.csv"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    console.error('❌ Error exporting connections:', error);
    return NextResponse.json(
      { error: 'Failed to export connections', details: error.message },
      { status: 500 }
    );
  }
}
