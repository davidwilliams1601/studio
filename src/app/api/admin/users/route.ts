import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { verifyAdminAccess } from '@/lib/admin-auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * Admin User List Endpoint
 * Returns paginated list of users with search and filter capabilities
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tierFilter = searchParams.get('tier')?.split(',').filter(Boolean) || [];
    const statusFilter = searchParams.get('status')?.split(',').filter(Boolean) || [];
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await getDb();
    let query = db.collection('users');

    // Apply tier filter if provided
    if (tierFilter.length > 0 && tierFilter.length < 4) {
      // Only apply filter if not selecting all tiers
      query = query.where('tier', 'in', tierFilter) as any;
    }

    // Fetch users
    const snapshot = await query.get();
    let users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email || '',
        displayName: data.displayName || '',
        tier: data.tier || 'free',
        subscriptionStatus: data.subscriptionStatus || 'active',
        createdAt: data.createdAt?.toDate?.() || new Date(),
        upgradeDate: data.upgradeDate?.toDate?.() || null,
        stripeCustomerId: data.stripeCustomerId || null,
        stripeSubscriptionId: data.stripeSubscriptionId || null,
      };
    });

    // Apply search filter (client-side since Firestore doesn't support full-text search)
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user =>
        user.email.toLowerCase().includes(searchLower) ||
        user.displayName.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter (client-side)
    if (statusFilter.length > 0) {
      users = users.filter(user => statusFilter.includes(user.subscriptionStatus));
    }

    // Sort by created date (newest first)
    users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Calculate pagination
    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    console.log(`📊 Admin ${admin.email} fetched ${paginatedUsers.length} users (page ${page}/${totalPages})`);

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('User list endpoint error:', error);

    const isAuthError =
      error.message?.includes('Admin access') ||
      error.message?.includes('token');
    const statusCode = isAuthError ? 403 : 500;

    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: statusCode }
    );
  }
}
