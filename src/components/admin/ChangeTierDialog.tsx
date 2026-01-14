import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User } from './UserTable';
import { useAuth } from '@/contexts/AuthContext';

interface ChangeTierDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ChangeTierDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ChangeTierDialogProps) {
  const { user: authUser } = useAuth();
  const [newTier, setNewTier] = useState<string>('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !authUser || !newTier) return;

    if (!reason.trim()) {
      setError('Please provide a reason for this tier change');
      return;
    }

    if (newTier === user.tier) {
      setError('Please select a different tier');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const idToken = await authUser.getIdToken();
      const response = await fetch('/api/admin/upgrade-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          userId: user.uid,
          tier: newTier,
          reason: reason.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change tier');
      }

      // Success
      setReason('');
      setNewTier('');
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      console.error('Error changing tier:', err);
      setError(err.message || 'Failed to change tier');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNewTier('');
      setReason('');
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Tier</DialogTitle>
          <DialogDescription>
            Change the subscription tier for {user?.email}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Tier */}
          <div className="space-y-2">
            <Label>Current Tier</Label>
            <div className="text-sm font-medium capitalize">{user?.tier}</div>
          </div>

          {/* New Tier */}
          <div className="space-y-2">
            <Label htmlFor="tier">New Tier *</Label>
            <Select value={newTier} onValueChange={setNewTier}>
              <SelectTrigger id="tier">
                <SelectValue placeholder="Select a tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro (£10/month)</SelectItem>
                <SelectItem value="business">Business (£75/month for up to 10 users)</SelectItem>
                <SelectItem value="enterprise">Enterprise (£99/month)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you're changing this user's tier..."
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This will update the tier in Firestore. If the user
              has an active Stripe subscription, you may need to manually update it in
              Stripe as well.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={!newTier || !reason.trim()}>
              Change Tier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
