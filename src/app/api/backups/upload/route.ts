import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, getDb, getStorage } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { MAX_UPLOAD_SIZE } from '@/types/linkedin';
import crypto from 'crypto';

/**
 * POST /api/backups/upload
 *
 * Generates a signed URL for uploading LinkedIn export to Firebase Storage
 * Creates a backup document in Firestore
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const {fileName, fileSize, contentType, orgId } = body;

    // Validate inputs
    if (!fileName || !fileSize || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileSize, contentType' },
        { status: 400 }
      );
    }

    // Validate file size
    if (fileSize > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          details: `Maximum file size is ${MAX_UPLOAD_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    // Validate content type (should be ZIP)
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream',
    ];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          details: 'Only ZIP files are allowed',
        },
        { status: 400 }
      );
    }

    // Generate unique backup ID
    const backupId = crypto.randomBytes(16).toString('hex');

    // Create storage path
    const storagePath = `users/${uid}/linkedin-exports/${backupId}/raw.zip`;

    // Create backup document in Firestore
    const db = await getDb();
    const now = Timestamp.now();
    const thirtyDaysFromNow = Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const twoYearsFromNow = Timestamp.fromMillis(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);

    const backupData = {
      backupId,
      uid,
      ...(orgId && { orgId }),
      source: 'linkedin_export',
      status: 'uploaded',
      storagePaths: {
        raw: storagePath,
      },
      createdAt: now,
      updatedAt: now,
      contains: {
        connections: false,
        profile: false,
        messages: false,
        positions: false,
        education: false,
        skills: false,
        recommendations: false,
      },
      retention: {
        rawExpiresAt: thirtyDaysFromNow,
        derivedExpiresAt: twoYearsFromNow,
        keepRawForever: false,
      },
      fileSize,
      metadata: {
        fileName,
        uploadedFromIp: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    };

    await db.collection('backups').doc(backupId).set(backupData);

    // Generate signed URL for upload
    const storage = await getStorage();
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    });

    // Return the signed URL and backup ID
    return NextResponse.json({
      backupId,
      uploadUrl: signedUrl,
      storagePath,
      expiresIn: 900, // 15 minutes in seconds
    });
  } catch (error: any) {
    console.error('Upload endpoint error:', error);

    return NextResponse.json(
      { error: 'Failed to generate upload URL', details: error.message },
      { status: 500 }
    );
  }
}
