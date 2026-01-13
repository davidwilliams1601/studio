// src/lib/admin-analytics.ts
import { getDb } from './firebase-admin';
import type { SubscriptionTier } from './subscription-tiers';

// Paid tiers only (excludes 'free')
type PaidTier = 'pro' | 'business' | 'enterprise';

export interface SubscriberCounts {
  free: number;
  pro: number;
  business: number;
  enterprise: number;
  total: number;
}

export interface ChurnData {
  thisMonth: number;
  lastMonth: number;
  threeMonthAvg: number;
  churnRate: number;
  trend: 'up' | 'down' | 'stable';
}

export interface GrowthData {
  usersToday: number;
  usersThisWeek: number;
  usersThisMonth: number;
  usersLastMonth: number;
  growthRate: number;
}

export interface MRRBreakdown {
  active: number;
  cancelled: number;
  pastDue: number;
  total: number;
  details: {
    active: { pro: number; business: number; enterprise: number };
    cancelled: { pro: number; business: number; enterprise: number };
    pastDue: { pro: number; business: number; enterprise: number };
  };
}

export interface AnalyticsData {
  mrr: number;
  mrrBreakdown: MRRBreakdown;
  totalRevenue: number;
  subscriberCounts: SubscriberCounts;
  churnData: ChurnData;
  growthData: GrowthData;
  conversionRate: number;
  lastUpdated: Date;
}

export interface DailySignupData {
  date: string; // YYYY-MM-DD
  value: number;
}

/**
 * Calculate Monthly Recurring Revenue with breakdown by status
 * Uses Firestore for speed (instead of querying Stripe API)
 * Prices in pence (GBP)
 */
export async function calculateMRR(): Promise<MRRBreakdown> {
  const db = await getDb();

  try {
    // Query all paid tier users (regardless of status)
    const paidUsersSnapshot = await db
      .collection('users')
      .where('tier', 'in', ['pro', 'business', 'enterprise'])
      .get();

    const breakdown: MRRBreakdown = {
      active: 0,
      cancelled: 0,
      pastDue: 0,
      total: 0,
      details: {
        active: { pro: 0, business: 0, enterprise: 0 },
        cancelled: { pro: 0, business: 0, enterprise: 0 },
        pastDue: { pro: 0, business: 0, enterprise: 0 },
      },
    };

    for (const doc of paidUsersSnapshot.docs) {
      const data = doc.data();
      const tier = data.tier as PaidTier; // Only paid tiers are queried
      const status = (data.subscriptionStatus || 'active') as string;

      // Calculate revenue for this tier (in pence - GBP)
      let tierRevenue = 0;
      switch (tier) {
        case 'pro':
          tierRevenue = 1000; // £10.00
          break;
        case 'business':
          tierRevenue = 2900; // £29.00
          break;
        case 'enterprise':
          tierRevenue = 9900; // £99.00
          break;
      }

      // Add to appropriate status bucket
      if (status === 'active') {
        breakdown.active += tierRevenue;
        breakdown.details.active[tier]++;
      } else if (status === 'cancelled' || status === 'cancelling') {
        breakdown.cancelled += tierRevenue;
        breakdown.details.cancelled[tier]++;
      } else if (status === 'past_due') {
        breakdown.pastDue += tierRevenue;
        breakdown.details.pastDue[tier]++;
      } else {
        // Default to active if status is missing
        breakdown.active += tierRevenue;
        breakdown.details.active[tier]++;
      }

      breakdown.total += tierRevenue;
    }

    console.log(`📊 MRR Breakdown:`);
    console.log(`  Active: £${(breakdown.active / 100).toFixed(2)} (${breakdown.details.active.pro} Pro, ${breakdown.details.active.business} Biz, ${breakdown.details.active.enterprise} Ent)`);
    console.log(`  Cancelled: £${(breakdown.cancelled / 100).toFixed(2)} (${breakdown.details.cancelled.pro} Pro, ${breakdown.details.cancelled.business} Biz, ${breakdown.details.cancelled.enterprise} Ent)`);
    console.log(`  Past Due: £${(breakdown.pastDue / 100).toFixed(2)} (${breakdown.details.pastDue.pro} Pro, ${breakdown.details.pastDue.business} Biz, ${breakdown.details.pastDue.enterprise} Ent)`);
    console.log(`  Total: £${(breakdown.total / 100).toFixed(2)}`);

    return breakdown;
  } catch (error: any) {
    console.error('Failed to calculate MRR:', error);
    throw new Error(`MRR calculation failed: ${error.message}`);
  }
}

/**
 * Get subscriber counts by tier
 */
export async function getSubscriberCounts(): Promise<SubscriberCounts> {
  const db = await getDb();

  try {
    // Query counts for each tier
    const [freeCount, proCount, businessCount, enterpriseCount] = await Promise.all([
      db.collection('users').where('tier', '==', 'free').count().get(),
      db.collection('users').where('tier', '==', 'pro').count().get(),
      db.collection('users').where('tier', '==', 'business').count().get(),
      db.collection('users').where('tier', '==', 'enterprise').count().get(),
    ]);

    const counts = {
      free: freeCount.data().count,
      pro: proCount.data().count,
      business: businessCount.data().count,
      enterprise: enterpriseCount.data().count,
      total: 0,
    };

    counts.total = counts.free + counts.pro + counts.business + counts.enterprise;

    console.log(`📊 Subscriber counts:`, counts);
    return counts;
  } catch (error: any) {
    console.error('Failed to get subscriber counts:', error);
    throw new Error(`Subscriber count query failed: ${error.message}`);
  }
}

/**
 * Calculate churn rate (cancellations)
 */
export async function calculateChurnRate(): Promise<ChurnData> {
  const db = await getDb();

  try {
    const now = new Date();

    // This month boundaries
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Last month boundaries
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Two months ago boundaries
    const startOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const endOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59);

    const [
      thisMonthSnapshot,
      lastMonthSnapshot,
      twoMonthsAgoSnapshot,
      activeSubscribersSnapshot,
    ] = await Promise.all([
      db
        .collection('users')
        .where('cancelledAt', '>=', startOfMonth)
        .where('cancelledAt', '<=', endOfMonth)
        .get(),

      db
        .collection('users')
        .where('cancelledAt', '>=', startOfLastMonth)
        .where('cancelledAt', '<=', endOfLastMonth)
        .get(),

      db
        .collection('users')
        .where('cancelledAt', '>=', startOfTwoMonthsAgo)
        .where('cancelledAt', '<=', endOfTwoMonthsAgo)
        .get(),

      db
        .collection('users')
        .where('subscriptionStatus', '==', 'active')
        .where('tier', 'in', ['pro', 'business', 'enterprise'])
        .get(),
    ]);

    const thisMonth = thisMonthSnapshot.size;
    const lastMonth = lastMonthSnapshot.size;
    const twoMonthsAgo = twoMonthsAgoSnapshot.size;
    const activeCount = activeSubscribersSnapshot.size;

    // Calculate three-month average
    const threeMonthAvg = (thisMonth + lastMonth + twoMonthsAgo) / 3;

    // Calculate churn rate as percentage of active subscribers
    const churnRate = activeCount > 0 ? (thisMonth / activeCount) * 100 : 0;

    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (thisMonth > lastMonth * 1.1) trend = 'up'; // 10% increase is "up"
    else if (thisMonth < lastMonth * 0.9) trend = 'down'; // 10% decrease is "down"

    const churnData: ChurnData = {
      thisMonth,
      lastMonth,
      threeMonthAvg: parseFloat(threeMonthAvg.toFixed(2)),
      churnRate: parseFloat(churnRate.toFixed(2)),
      trend,
    };

    console.log(`📊 Churn data:`, churnData);
    return churnData;
  } catch (error: any) {
    console.error('Failed to calculate churn rate:', error);
    throw new Error(`Churn calculation failed: ${error.message}`);
  }
}

/**
 * Get user growth statistics
 */
export async function getUserGrowthStats(): Promise<GrowthData> {
  const db = await getDb();

  try {
    const now = new Date();

    // Today (from start of day)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Week ago
    const weekAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Month ago
    const monthAgo = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Two months ago
    const twoMonthsAgo = new Date(startOfToday.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      todaySnapshot,
      weekSnapshot,
      monthSnapshot,
      lastMonthSnapshot,
    ] = await Promise.all([
      db.collection('users').where('createdAt', '>=', startOfToday).get(),
      db.collection('users').where('createdAt', '>=', weekAgo).get(),
      db.collection('users').where('createdAt', '>=', monthAgo).get(),
      db
        .collection('users')
        .where('createdAt', '>=', twoMonthsAgo)
        .where('createdAt', '<', monthAgo)
        .get(),
    ]);

    const usersToday = todaySnapshot.size;
    const usersThisWeek = weekSnapshot.size;
    const usersThisMonth = monthSnapshot.size;
    const usersLastMonth = lastMonthSnapshot.size;

    // Calculate growth rate (month-over-month)
    const growthRate =
      usersLastMonth > 0
        ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100
        : 0;

    const growthData: GrowthData = {
      usersToday,
      usersThisWeek,
      usersThisMonth,
      usersLastMonth,
      growthRate: parseFloat(growthRate.toFixed(2)),
    };

    console.log(`📊 Growth data:`, growthData);
    return growthData;
  } catch (error: any) {
    console.error('Failed to get growth stats:', error);
    throw new Error(`Growth stats query failed: ${error.message}`);
  }
}

/**
 * Get daily signup history for charts
 * @param days - Number of days to fetch (default: 30)
 */
export async function getDailySignupHistory(days: number = 30): Promise<DailySignupData[]> {
  const db = await getDb();

  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Query all users created in date range
    const usersSnapshot = await db
      .collection('users')
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    // Group by date
    const dailyCounts: Record<string, number> = {};

    usersSnapshot.forEach((doc) => {
      const createdAt = doc.data().createdAt.toDate();
      const dateKey = createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
    });

    // Fill in missing dates with 0
    const result: DailySignupData[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      result.push({
        date: dateKey,
        value: dailyCounts[dateKey] || 0,
      });
    }

    console.log(`📊 Daily signup history: ${result.length} days`);
    return result;
  } catch (error: any) {
    console.error('Failed to get daily signup history:', error);
    throw new Error(`Daily signup history query failed: ${error.message}`);
  }
}

/**
 * Calculate all analytics data at once
 * Used by cron job to cache results
 */
export async function calculateAllAnalytics(): Promise<AnalyticsData> {
  console.log('📊 Calculating all analytics...');

  const [mrrBreakdown, subscriberCounts, churnData, growthData] = await Promise.all([
    calculateMRR(),
    getSubscriberCounts(),
    calculateChurnRate(),
    getUserGrowthStats(),
  ]);

  // Calculate conversion rate (paid users / total users)
  const paidUsers =
    subscriberCounts.pro + subscriberCounts.business + subscriberCounts.enterprise;
  const conversionRate =
    subscriberCounts.total > 0
      ? (paidUsers / subscriberCounts.total) * 100
      : 0;

  const analytics: AnalyticsData = {
    mrr: mrrBreakdown.active, // Primary MRR is active subscriptions
    mrrBreakdown,
    totalRevenue: 0, // TODO: Track in separate collection or calculate from Stripe
    subscriberCounts,
    churnData,
    growthData,
    conversionRate: parseFloat(conversionRate.toFixed(2)),
    lastUpdated: new Date(),
  };

  console.log('✅ Analytics calculation complete');
  return analytics;
}

/**
 * Get cached analytics from Firestore
 * Returns null if cache doesn't exist or is stale
 */
export async function getCachedAnalytics(maxAgeMinutes: number = 15): Promise<AnalyticsData | null> {
  const db = await getDb();

  try {
    const cacheDoc = await db.collection('analyticsCache').doc('current').get();

    if (!cacheDoc.exists) {
      console.log('📊 No analytics cache found');
      return null;
    }

    const data = cacheDoc.data() as AnalyticsData;
    const lastUpdated = data.lastUpdated as any;
    const age = Date.now() - lastUpdated.toDate().getTime();
    const maxAge = maxAgeMinutes * 60 * 1000;

    if (age > maxAge) {
      console.log(`📊 Analytics cache is stale (${Math.floor(age / 60000)} minutes old)`);
      return null;
    }

    console.log(`📊 Using cached analytics (${Math.floor(age / 60000)} minutes old)`);
    return data;
  } catch (error: any) {
    console.error('Failed to get cached analytics:', error);
    return null;
  }
}

/**
 * Update analytics cache in Firestore
 */
export async function updateAnalyticsCache(analytics: AnalyticsData): Promise<void> {
  const db = await getDb();

  try {
    await db.collection('analyticsCache').doc('current').set(analytics);
    console.log('✅ Analytics cache updated');
  } catch (error: any) {
    console.error('Failed to update analytics cache:', error);
    throw new Error(`Cache update failed: ${error.message}`);
  }
}
