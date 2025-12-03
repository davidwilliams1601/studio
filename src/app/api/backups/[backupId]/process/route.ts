import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, getDb, getStorage } from '@/lib/firebase-admin';
import { parseLinkedInExport } from '@/lib/linkedin-parser';
import { Timestamp } from 'firebase-admin/firestore';
import {
  BackupSnapshot,
  ConnectionByIndustry,
  ConnectionByLocation,
  ProfileCompletenessScore,
} from '@/types/linkedin';
import crypto from 'crypto';

/**
 * POST /api/backups/[backupId]/process
 *
 * Processes an uploaded LinkedIn export:
 * 1. Downloads ZIP from Storage
 * 2. Parses the export
 * 3. Creates snapshot with analytics
 * 4. Updates backup status
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { backupId: string } }
) {
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

    const { backupId } = params;

    // Get backup document
    const db = await getDb();
    const backupRef = db.collection('backups').doc(backupId);
    const backupDoc = await backupRef.get();

    if (!backupDoc.exists) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      );
    }

    const backup = backupDoc.data();

    // Verify ownership
    if (backup!.uid !== uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if already processing or processed
    if (backup!.status === 'processing') {
      return NextResponse.json(
        { error: 'Backup is already being processed' },
        { status: 400 }
      );
    }

    if (backup!.status === 'ready') {
      return NextResponse.json(
        { message: 'Backup already processed', backupId },
        { status: 200 }
      );
    }

    // Update status to processing
    await backupRef.update({
      status: 'processing',
      updatedAt: Timestamp.now(),
    });

    // Download ZIP from Storage
    const storage = await getStorage();
    const bucket = storage.bucket();
    const file = bucket.file(backup!.storagePaths.raw);

    const [fileBuffer] = await file.download();

    // Parse the export
    let parsedData;
    try {
      parsedData = await parseLinkedInExport(fileBuffer);
    } catch (parseError: any) {
      // Update backup with error
      await backupRef.update({
        status: 'error',
        errorMessage: `Failed to parse export: ${parseError.message}`,
        updatedAt: Timestamp.now(),
      });

      return NextResponse.json(
        { error: 'Failed to parse LinkedIn export', details: parseError.message },
        { status: 400 }
      );
    }

    // Generate analytics
    const analytics = generateAnalytics(parsedData);

    // Create snapshot document
    const snapshotId = crypto.randomBytes(16).toString('hex');
    const snapshot: Omit<BackupSnapshot, 'snapshotId' | 'backupId' | 'uid' | 'createdAt'> = {
      totalConnections: parsedData.connections.length,
      connectionsByIndustry: analytics.byIndustry,
      connectionsByLocation: analytics.byLocation,
      connectionsBySeniority: [],
      connectionsByCompany: analytics.byCompany,
      profileCompletenessScore: analytics.completenessScore,
      recommendations: parsedData.recommendations,
    };

    await db
      .collection('backupSnapshots')
      .doc(uid)
      .collection('snapshots')
      .doc(snapshotId)
      .set({
        snapshotId,
        backupId,
        uid,
        createdAt: Timestamp.now(),
        ...snapshot,
      });

    // Update backup document
    await backupRef.update({
      status: 'ready',
      processedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      contains: {
        connections: parsedData.connections.length > 0,
        profile: !!parsedData.profile,
        messages: false,
        positions: parsedData.positions.length > 0,
        education: parsedData.education.length > 0,
        skills: parsedData.skills.length > 0,
        recommendations: parsedData.recommendations.length > 0,
      },
    });

    return NextResponse.json({
      success: true,
      backupId,
      snapshotId,
      summary: {
        connections: parsedData.connections.length,
        positions: parsedData.positions.length,
        education: parsedData.education.length,
        skills: parsedData.skills.length,
        recommendations: parsedData.recommendations.length,
      },
    });
  } catch (error: any) {
    console.error('Backup processing error:', error);

    // Try to update backup status to error
    try {
      const db = await getDb();
      await db.collection('backups').doc(params.backupId).update({
        status: 'error',
        errorMessage: error.message,
        updatedAt: Timestamp.now(),
      });
    } catch (updateError) {
      console.error('Failed to update backup status:', updateError);
    }

    return NextResponse.json(
      { error: 'Failed to process backup', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Generate analytics from parsed LinkedIn data
 */
function generateAnalytics(data: any) {
  // Group connections by industry
  const industryMap = new Map<string, number>();
  const locationMap = new Map<string, number>();
  const companyMap = new Map<string, number>();

  data.connections.forEach((conn: any) => {
    // Count by company
    if (conn.company) {
      companyMap.set(conn.company, (companyMap.get(conn.company) || 0) + 1);
    }
  });

  // Extract top items
  const byIndustry: ConnectionByIndustry[] = Array.from(industryMap.entries())
    .map(([industry, count]) => ({ industry, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const byLocation: ConnectionByLocation[] = Array.from(locationMap.entries())
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const byCompany = Array.from(companyMap.entries())
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Calculate profile completeness
  const completenessScore = calculateProfileCompleteness(data);

  return {
    byIndustry,
    byLocation,
    byCompany,
    completenessScore,
  };
}

/**
 * Calculate profile completeness score
 */
function calculateProfileCompleteness(data: any): ProfileCompletenessScore {
  const profile = data.profile;
  const scores = {
    headline: profile?.headline ? 100 : 0,
    summary: profile?.summary ? 100 : 0,
    experience: Math.min(100, (data.positions.length / 3) * 100),
    education: Math.min(100, (data.education.length / 2) * 100),
    skills: Math.min(100, (data.skills.length / 10) * 100),
    recommendations: Math.min(100, (data.recommendations.length / 3) * 100),
  };

  const overall = Math.round(
    (scores.headline +
      scores.summary +
      scores.experience +
      scores.education +
      scores.skills +
      scores.recommendations) /
      6
  );

  return {
    overall,
    breakdown: scores,
  };
}
