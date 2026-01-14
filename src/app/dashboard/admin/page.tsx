'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { KPICard } from '@/components/admin/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingDown, Percent } from 'lucide-react';
import type { AnalyticsData } from '@/lib/admin-analytics';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;

      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/admin/analytics', {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading analytics: {error}</p>
            <p className="text-sm text-red-600 mt-2">
              The analytics endpoint may not be deployed yet. This will work once you implement /api/admin/analytics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const mrrPounds = (analytics.mrr / 100).toFixed(2);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-500">
          Monitor your subscription metrics and user growth
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="MRR"
          value={`£${mrrPounds}`}
          icon={DollarSign}
        />
        <KPICard
          title="Total Users"
          value={analytics.subscriberCounts.total}
          trend={{
            direction: analytics.growthData.growthRate >= 0 ? 'up' : 'down',
            value: Math.abs(analytics.growthData.growthRate),
          }}
          icon={Users}
        />
        <KPICard
          title="Churn Rate"
          value={`${analytics.churnData.churnRate}%`}
          trend={{
            direction: analytics.churnData.trend === 'up' ? 'up' : 'down',
            value: Math.abs(
              ((analytics.churnData.thisMonth - analytics.churnData.lastMonth) /
                (analytics.churnData.lastMonth || 1)) *
                100
            ),
          }}
          icon={TrendingDown}
        />
        <KPICard
          title="Conversion Rate"
          value={`${analytics.conversionRate}%`}
          icon={Percent}
        />
      </div>

      {/* MRR Breakdown by Status */}
      <Card>
        <CardHeader>
          <CardTitle>MRR Breakdown by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900">Active Subscriptions</p>
                <p className="text-xs text-green-700">
                  {analytics.mrrBreakdown.details.active.pro} Pro, {analytics.mrrBreakdown.details.active.business} Business, {analytics.mrrBreakdown.details.active.enterprise} Enterprise
                </p>
              </div>
              <span className="text-lg font-bold text-green-900">
                £{(analytics.mrrBreakdown.active / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-900">Cancelled Subscriptions</p>
                <p className="text-xs text-red-700">
                  {analytics.mrrBreakdown.details.cancelled.pro} Pro, {analytics.mrrBreakdown.details.cancelled.business} Business, {analytics.mrrBreakdown.details.cancelled.enterprise} Enterprise
                </p>
              </div>
              <span className="text-lg font-bold text-red-900">
                £{(analytics.mrrBreakdown.cancelled / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-yellow-900">Past Due</p>
                <p className="text-xs text-yellow-700">
                  {analytics.mrrBreakdown.details.pastDue.pro} Pro, {analytics.mrrBreakdown.details.pastDue.business} Business, {analytics.mrrBreakdown.details.pastDue.enterprise} Enterprise
                </p>
              </div>
              <span className="text-lg font-bold text-yellow-900">
                £{(analytics.mrrBreakdown.pastDue / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border-t-2 border-gray-300">
              <p className="text-sm font-bold text-gray-900">Potential MRR</p>
              <span className="text-xl font-bold text-gray-900">
                £{(analytics.mrrBreakdown.total / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriber Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Subscribers by Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm font-medium">Free</span>
              </div>
              <span className="text-sm text-gray-600">
                {analytics.subscriberCounts.free} users
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">Pro</span>
              </div>
              <span className="text-sm text-gray-600">
                {analytics.subscriberCounts.pro} users
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Business</span>
              </div>
              <span className="text-sm text-gray-600">
                {analytics.subscriberCounts.business} users
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm font-medium">Enterprise</span>
              </div>
              <span className="text-sm text-gray-600">
                {analytics.subscriberCounts.enterprise} users
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-2xl font-bold">{analytics.growthData.usersToday}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-2xl font-bold">{analytics.growthData.usersThisWeek}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold">{analytics.growthData.usersThisMonth}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Month</p>
              <p className="text-2xl font-bold">{analytics.growthData.usersLastMonth}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            💡 <strong>Admin Panel Active:</strong> You have full access to user management, analytics, and system controls.
            More features coming soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
