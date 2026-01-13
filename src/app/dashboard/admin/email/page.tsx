'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Mail, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function EmailToolPage() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Tier filters
  const [selectedTiers, setSelectedTiers] = useState<string[]>(['free', 'pro', 'business', 'enterprise']);

  // Status filters
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['active']);

  const [testMode, setTestMode] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const tiers = [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'business', label: 'Business' },
    { value: 'enterprise', label: 'Enterprise' },
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'past_due', label: 'Past Due' },
  ];

  // Fetch recipient count when filters change
  useEffect(() => {
    fetchRecipientCount();
  }, [selectedTiers, selectedStatuses]);

  const fetchRecipientCount = async () => {
    if (!user || selectedTiers.length === 0 || selectedStatuses.length === 0) {
      setRecipientCount(0);
      return;
    }

    setLoadingCount(true);
    try {
      const idToken = await user.getIdToken();
      const params = new URLSearchParams();

      if (selectedTiers.length < 4) {
        params.append('tier', selectedTiers.join(','));
      }

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter by status client-side
        const filteredUsers = data.users.filter((u: any) =>
          selectedStatuses.includes(u.subscriptionStatus)
        );
        setRecipientCount(filteredUsers.length);
      }
    } catch (err) {
      console.error('Error fetching recipient count:', err);
    } finally {
      setLoadingCount(false);
    }
  };

  const toggleTier = (tier: string) => {
    if (selectedTiers.includes(tier)) {
      setSelectedTiers(selectedTiers.filter(t => t !== tier));
    } else {
      setSelectedTiers([...selectedTiers, tier]);
    }
  };

  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const handleSend = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          subject,
          message,
          tiers: selectedTiers,
          statuses: selectedStatuses,
          testMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails');
      }

      setSuccess(data.message);

      // Reset form
      setSubject('');
      setMessage('');
      setTestMode(false);
    } catch (err: any) {
      console.error('Error sending emails:', err);
      setError(err.message || 'Failed to send emails');
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const canSend = subject.trim() && message.trim() && selectedTiers.length > 0 && selectedStatuses.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Email Tool</h2>
        <p className="text-gray-500 mt-1">
          Send emails to filtered groups of users
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-green-800 font-medium">{success}</p>
            <p className="text-sm text-green-700 mt-1">
              All emails have been queued for delivery.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error sending emails</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Composer */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
              <CardDescription>
                Write your email message for the selected recipients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Enter email subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={10}
                  disabled={loading}
                />
                <p className="text-sm text-gray-500">
                  Plain text only. The message will be formatted in a branded email template.
                </p>
              </div>

              {/* Test Mode */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <input
                  type="checkbox"
                  id="testMode"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <div className="flex-1">
                  <Label htmlFor="testMode" className="cursor-pointer font-medium text-blue-900">
                    Test Mode
                  </Label>
                  <p className="text-sm text-blue-700">
                    Send only to your admin email for testing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Preview */}
        <div className="space-y-6">
          {/* Recipient Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-4xl font-bold text-blue-600">
                  {loadingCount ? '...' : testMode ? '1' : recipientCount.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {testMode ? 'Test email (admin only)' : 'users will receive this email'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tier Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filter by Tier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tiers.map((tier) => (
                <div key={tier.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`tier-${tier.value}`}
                    checked={selectedTiers.includes(tier.value)}
                    onChange={() => toggleTier(tier.value)}
                    disabled={loading}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor={`tier-${tier.value}`} className="cursor-pointer font-normal">
                    {tier.label}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Status Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filter by Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {statuses.map((status) => (
                <div key={status.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`status-${status.value}`}
                    checked={selectedStatuses.includes(status.value)}
                    onChange={() => toggleStatus(status.value)}
                    disabled={loading}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor={`status-${status.value}`} className="cursor-pointer font-normal">
                    {status.label}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Send Button */}
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!canSend || loading}
            fullWidth
            icon={<Mail size={20} />}
            loading={loading}
          >
            {testMode ? 'Send Test Email' : 'Send to All Recipients'}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {testMode ? 'Send Test Email?' : 'Send Bulk Email?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {testMode ? (
                <>
                  This will send a test email to your admin account to preview how it will look.
                </>
              ) : (
                <>
                  This will send an email to <strong>{recipientCount} users</strong> with the following filters:
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm space-y-1">
                    <div><strong>Tiers:</strong> {selectedTiers.map(t => tiers.find(tier => tier.value === t)?.label).join(', ')}</div>
                    <div><strong>Statuses:</strong> {selectedStatuses.map(s => statuses.find(status => status.value === s)?.label).join(', ')}</div>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    <strong>Warning:</strong> This action cannot be undone. Make sure your message is correct.
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend} disabled={loading}>
              {loading ? 'Sending...' : testMode ? 'Send Test' : 'Send Email'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
