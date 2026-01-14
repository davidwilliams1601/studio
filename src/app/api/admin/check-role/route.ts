import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * Admin Role Verification Endpoint
 * Verifies that the authenticated user has admin privileges
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access - this will throw if user is not an admin
    const admin = await verifyAdminAccess(request);

    console.log(`✅ Admin access verified for ${admin.email}`);

    // Return success with admin info
    return NextResponse.json({
      success: true,
      admin: {
        uid: admin.uid,
        email: admin.email,
      },
    });
  } catch (error: any) {
    console.error('Admin role check failed:', error);

    const isAuthError =
      error.message?.includes('Admin access') ||
      error.message?.includes('token') ||
      error.message?.includes('Unauthorized');

    const statusCode = isAuthError ? 403 : 500;

    return NextResponse.json(
      { error: error.message || 'Admin access denied' },
      { status: statusCode }
    );
  }
}
