import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User } from './UserTable';
import { useAuth } from '@/contexts/AuthContext';

interface CancelSubscriptionDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CancelSubscriptionDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: CancelSubscriptionDialogProps) {
  const { user: authUser } = useAuth();
  const [immediate, setImmediate] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !authUser) return;

    if (!reason.trim()) {
      setError('Please provide a reason for cancelling this subscription');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const idToken = await authUser.getIdToken();
      const response = await fetch(`/api/admin/users/${user.uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          action: 'cancel_subscription',
          immediate,
          reason: reason.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Success
      setReason('');
      setImmediate(false);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      console.error('Error cancelling subscription:', err);
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setImmediate(false);
      setReason('');
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
          <AlertDialogDescription>
            Cancel the subscription for {user?.email}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cancellation Type */}
          <div className="space-y-3">
            <Label>Cancellation Type</Label>
            <RadioGroup value={immediate ? 'immediate' : 'period_end'} onValueChange={(value) => setImmediate(value === 'immediate')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="period_end" id="period_end" />
                <Label htmlFor="period_end" className="font-normal cursor-pointer">
                  Cancel at period end (recommended)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="immediate" id="immediate" />
                <Label htmlFor="immediate" className="font-normal cursor-pointer">
                  Cancel immediately
                </Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-gray-500 mt-1">
              {immediate
                ? 'The subscription will be cancelled immediately and the user will lose access.'
                : 'The subscription will continue until the end of the current billing period.'}
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you're cancelling this subscription..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong>{' '}
              {immediate
                ? 'The user will lose access immediately and will not be refunded for the remainder of their billing period.'
                : 'The user will retain access until the end of their current billing period.'}
            </p>
          </div>

          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              loading={loading}
              disabled={!reason.trim()}
            >
              Cancel Subscription
            </Button>
          </AlertDialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
