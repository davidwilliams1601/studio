import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to check Firebase Admin SDK status
 * This helps diagnose session creation issues
 */
export async function GET() {
  try {
    console.log('[firebase-admin-debug] Checking Firebase Admin SDK status...');

    // Check environment variables
    const envCheck = {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasStorageBucket: !!process.env.FIREBASE_STORAGE_BUCKET,
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length,
      privateKeyStart: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 30),
    };

    console.log('[firebase-admin-debug] Environment variables:', envCheck);

    // Try to get auth instance
    console.log('[firebase-admin-debug] Getting Auth instance...');
    const auth = await getAuth();

    if (!auth) {
      return NextResponse.json({
        status: 'error',
        message: 'Firebase Auth instance is null',
        envCheck,
      }, { status: 500 });
    }

    console.log('[firebase-admin-debug] Auth instance obtained successfully');

    // Check if createSessionCookie method exists
    const hasCreateSessionCookie = typeof auth.createSessionCookie === 'function';
    console.log('[firebase-admin-debug] Has createSessionCookie:', hasCreateSessionCookie);

    return NextResponse.json({
      status: 'success',
      message: 'Firebase Admin SDK is initialized correctly',
      envCheck: {
        ...envCheck,
        privateKey: envCheck.hasPrivateKey ? 'SET (hidden)' : 'MISSING',
        privateKeyStart: envCheck.privateKeyStart,
      },
      capabilities: {
        hasCreateSessionCookie,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[firebase-admin-debug] Error:', error);

    return NextResponse.json({
      status: 'error',
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
