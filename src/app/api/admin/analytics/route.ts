import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-auth';
import {
  calculateAllAnalytics,
  getCachedAnalytics,
  updateAnalyticsCache
} from '@/lib/admin-analytics';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * Admin Analytics Endpoint
 * Returns analytics data for the admin dashboard
 * Uses caching to avoid expensive calculations on every request
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await verifyAdminAccess(request);

    // Rate limiting
    const rateLimitResult = checkRateLimit(admin.uid, RATE_LIMITS.ADMIN_USERS_LIST);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetAt: new Date(rateLimitResult.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    console.log(`📊 Admin ${admin.email} requested analytics`);

    // Try to get cached analytics (15 minute cache)
    let analytics = await getCachedAnalytics(15);

    // If no cache or cache is stale, calculate fresh analytics
    if (!analytics) {
      console.log('📊 No cached analytics found, calculating fresh data...');
      analytics = await calculateAllAnalytics();

      // Update cache for next request
      await updateAnalyticsCache(analytics);
    } else {
      console.log('📊 Returning cached analytics');
    }

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Analytics endpoint error:', error);

    const isAuthError =
      error.message?.includes('Admin access') ||
      error.message?.includes('token');
    const statusCode = isAuthError ? 403 : 500;

    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: statusCode }
    );
  }
}
