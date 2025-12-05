import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/firebase-admin';

/**
 * Debug endpoint to check Firebase Admin SDK status
 * Only enable in development or with proper authentication
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[firebase-status] Checking Firebase Admin SDK status...');

    // Check environment variables
    const hasServiceAccountJson = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
    const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
    const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;

    console.log('[firebase-status] Environment variables:', {
      hasServiceAccountJson,
      hasProjectId,
      hasClientEmail,
      hasPrivateKey
    });

    // Try to get auth instance
    console.log('[firebase-status] Getting auth instance...');
    const auth = await getAuth();

    if (!auth) {
      return NextResponse.json({
        status: 'error',
        message: 'Auth instance is null',
        env: {
          hasServiceAccountJson,
          hasProjectId,
          hasClientEmail,
          hasPrivateKey
        }
      }, { status: 500 });
    }

    console.log('[firebase-status] Auth instance obtained successfully');

    // Try to list users (just get first one to test)
    try {
      const listResult = await auth.listUsers(1);
      console.log('[firebase-status] Successfully listed users');

      return NextResponse.json({
        status: 'ok',
        message: 'Firebase Admin SDK is working correctly',
        env: {
          hasServiceAccountJson,
          hasProjectId,
          hasClientEmail,
          hasPrivateKey
        },
        auth: {
          canListUsers: true,
          userCount: listResult.users.length
        }
      });
    } catch (listError: any) {
      console.error('[firebase-status] Failed to list users:', listError.message);

      return NextResponse.json({
        status: 'partial',
        message: 'Auth instance exists but cannot list users',
        error: listError.message,
        env: {
          hasServiceAccountJson,
          hasProjectId,
          hasClientEmail,
          hasPrivateKey
        }
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error('[firebase-status] Error:', error.message);
    console.error('[firebase-status] Stack:', error.stack);

    return NextResponse.json({
      status: 'error',
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
