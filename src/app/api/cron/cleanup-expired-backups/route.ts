import { NextRequest, NextResponse } from 'next/server';
import { getDb, getStorage } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * GET /api/cron/cleanup-expired-backups
 *
 * Cron job that runs daily to:
 * 1. Delete expired raw backup files (default: 30 days)
 * 2. Delete expired derived data (default: 2 years)
 * 3. Update backup documents
 *
 * Configured in vercel.json to run daily at 2 AM UTC
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const expectedSecret = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const storage = await getStorage();
    const bucket = storage.bucket();
    const now = Timestamp.now();

    let deletedRawFiles = 0;
    let deletedDerivedFiles = 0;
    let errors: string[] = [];

    // Query backups with expired raw files
    const expiredRawBackups = await db
      .collection('backups')
      .where('retention.rawExpiresAt', '<=', now)
      .where('retention.keepRawForever', '==', false)
      .get();

    console.log(`Found ${expiredRawBackups.size} backups with expired raw files`);

    // Delete expired raw files
    for (const doc of expiredRawBackups.docs) {
      const backup = doc.data();

      try {
        // Delete raw ZIP file
        if (backup.storagePaths?.raw) {
          const file = bucket.file(backup.storagePaths.raw);
          const [exists] = await file.exists();

          if (exists) {
            await file.delete();
            deletedRawFiles++;
            console.log(`Deleted raw file: ${backup.storagePaths.raw}`);
          }

          // Update backup document to remove raw path
          await doc.ref.update({
            'storagePaths.raw': null,
            updatedAt: now,
          });
        }
      } catch (error: any) {
        console.error(`Error deleting raw file for backup ${doc.id}:`, error);
        errors.push(`Backup ${doc.id}: ${error.message}`);
      }
    }

    // Query backups with expired derived files
    const expiredDerivedBackups = await db
      .collection('backups')
      .where('retention.derivedExpiresAt', '<=', now)
      .get();

    console.log(`Found ${expiredDerivedBackups.size} backups with expired derived files`);

    // Delete expired derived files and snapshots
    for (const doc of expiredDerivedBackups.docs) {
      const backup = doc.data();

      try {
        // Delete derived files directory
        if (backup.storagePaths?.derived) {
          await bucket.deleteFiles({
            prefix: backup.storagePaths.derived,
          });
          deletedDerivedFiles++;
          console.log(`Deleted derived files: ${backup.storagePaths.derived}`);
        }

        // Delete recovery pack
        if (backup.storagePaths?.recoveryPack) {
          const file = bucket.file(backup.storagePaths.recoveryPack);
          const [exists] = await file.exists();

          if (exists) {
            await file.delete();
            console.log(`Deleted recovery pack: ${backup.storagePaths.recoveryPack}`);
          }
        }

        // Delete backup snapshot
        const snapshotsSnapshot = await db
          .collection('backupSnapshots')
          .doc(backup.uid)
          .collection('snapshots')
          .where('backupId', '==', backup.backupId)
          .get();

        for (const snapshotDoc of snapshotsSnapshot.docs) {
          await snapshotDoc.ref.delete();
          console.log(`Deleted snapshot: ${snapshotDoc.id}`);
        }

        // Delete the backup document entirely
        await doc.ref.delete();
        console.log(`Deleted backup document: ${doc.id}`);
      } catch (error: any) {
        console.error(`Error deleting derived files for backup ${doc.id}:`, error);
        errors.push(`Backup ${doc.id}: ${error.message}`);
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        expiredRawBackups: expiredRawBackups.size,
        expiredDerivedBackups: expiredDerivedBackups.size,
        deletedRawFiles,
        deletedDerivedFiles,
        errors: errors.length,
      },
      errors,
    };

    console.log('Cleanup job completed:', summary);

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Cleanup cron job error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Cleanup job failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
