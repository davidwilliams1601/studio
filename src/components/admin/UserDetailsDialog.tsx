import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from './TierBadge';
import { User } from './UserTable';
import { useAuth } from '@/contexts/AuthContext';

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({
  user,
  open,
  onOpenChange,
}: UserDetailsDialogProps) {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      fetchUserDetails();
    } else {
      setDetails(null);
      setError(null);
    }
  }, [open, user]);

  async function fetchUserDetails() {
    if (!user || !authUser) return;

    setLoading(true);
    setError(null);

    try {
      const idToken = await authUser.getIdToken();
      const response = await fetch(`/api/admin/users/${user.uid}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      setDetails(data);
    } catch (err: any) {
      console.error('Error fetching user details:', err);
      setError(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number, currency: string = 'gbp') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View detailed information about this user account
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-3 py-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && details && (
          <div className="space-y-6">
            {/* User Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-900">
                Account Information
              </h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium">{details.user.email}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Display Name</dt>
                  <dd className="font-medium">{details.user.displayName || '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">User ID</dt>
                  <dd className="font-mono text-xs">{details.user.uid}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Tier</dt>
                  <dd>
                    <TierBadge tier={details.user.tier} />
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Status</dt>
                  <dd>
                    <Badge
                      variant={
                        details.user.subscriptionStatus === 'active'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {details.user.subscriptionStatus}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Onboarded</dt>
                  <dd>{details.user.hasCompletedOnboarding ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Created</dt>
                  <dd>{formatDate(details.user.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Upgraded</dt>
                  <dd>{formatDate(details.user.upgradeDate)}</dd>
                </div>
                {details.user.cancelledAt && (
                  <div>
                    <dt className="text-gray-500">Cancelled</dt>
                    <dd>{formatDate(details.user.cancelledAt)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Usage Information */}
            <div className="space-y-3 pt-3 border-t">
              <h3 className="font-semibold text-sm text-gray-900">Usage</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-500">Backups This Month</dt>
                  <dd className="font-medium">{details.user.backupsThisMonth}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Last Backup</dt>
                  <dd>{formatDate(details.user.lastBackupDate)}</dd>
                </div>
              </dl>
            </div>

            {/* Stripe Subscription */}
            {details.subscription && (
              <div className="space-y-3 pt-3 border-t">
                <h3 className="font-semibold text-sm text-gray-900">
                  Stripe Subscription
                </h3>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Subscription ID</dt>
                    <dd className="font-mono text-xs">
                      {details.subscription.id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Status</dt>
                    <dd>
                      <Badge>{details.subscription.status}</Badge>
                    </dd>
                  </div>
                  {details.subscription.items?.data?.[0]?.price && (
                    <div>
                      <dt className="text-gray-500">Price</dt>
                      <dd className="font-medium">
                        {formatCurrency(
                          details.subscription.items.data[0].price.unit_amount,
                          details.subscription.items.data[0].price.currency
                        )}
                        /month
                      </dd>
                    </div>
                  )}
                  {details.subscription.current_period_end && (
                    <div>
                      <dt className="text-gray-500">Period End</dt>
                      <dd>
                        {formatDate(
                          new Date(details.subscription.current_period_end * 1000)
                        )}
                      </dd>
                    </div>
                  )}
                  {details.subscription.cancel_at_period_end && (
                    <div className="col-span-2">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          ⚠️ This subscription is set to cancel at the end of the
                          current period
                        </p>
                      </div>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Stripe Customer Info */}
            {details.user.stripeCustomerId && (
              <div className="space-y-3 pt-3 border-t">
                <h3 className="font-semibold text-sm text-gray-900">Stripe</h3>
                <dl className="text-sm">
                  <div>
                    <dt className="text-gray-500">Customer ID</dt>
                    <dd className="font-mono text-xs">
                      {details.user.stripeCustomerId}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
