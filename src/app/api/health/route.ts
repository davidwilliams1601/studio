import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Simple health check endpoint
 */
export async function GET() {
  try {
    const hasServiceAccountJson = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
    const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
    const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasServiceAccountJson,
        hasProjectId,
        hasClientEmail,
        hasPrivateKey: hasPrivateKey ? 'yes (length: ' + (process.env.FIREBASE_PRIVATE_KEY?.length || 0) + ')' : 'no',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 });
  }
}
