import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * Admin Role Verification Endpoint
 * Checks if the current user has admin access
 * Used by AdminGuard component to protect admin routes
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAccess(request);

    return NextResponse.json({
      isAdmin: true,
      email: admin.email,
      uid: admin.uid,
    });
  } catch (error: any) {
    console.error('Admin role check failed:', error.message);

    return NextResponse.json(
      {
        isAdmin: false,
        error: error.message || 'Admin access required',
      },
      { status: 403 }
    );
  }
}
