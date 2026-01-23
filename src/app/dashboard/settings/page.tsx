'use client';


import { useState, useTransition, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { createStripePortalSessionAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { SubscriptionManager } from '@/components/subscription-manager';
import type { SubscriptionTier } from '@/lib/subscription-tiers';

export default function SettingsPage() {
  const { user } = useAuth();
  // In a real app, this would come from your auth/user state
  const [userPlan, setUserPlan] = useState<SubscriptionTier>('pro');
  const isBusinessPlan = userPlan === 'business';
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Email preferences state
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);

  const handleManageSubscription = () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to manage your subscription.',
      });
      return;
    }
    startTransition(async () => {
        const result = await createStripePortalSessionAction({ uid: user.uid });
        if (result?.error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.error,
            });
        }
    });
  }

  // Fetch email preferences on mount
  useEffect(() => {
    fetchEmailPreferences();
  }, [user]);

  const fetchEmailPreferences = async () => {
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/email/preferences', {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMarketingEmails(data.marketing ?? true); // Default to true if not set
      }
    } catch (error) {
      console.error('Failed to fetch email preferences:', error);
    } finally {
      setLoadingPreferences(false);
    }
  };

  const handleMarketingEmailsChange = async (checked: boolean) => {
    if (!user) return;

    setMarketingEmails(checked);
    setSavingPreferences(true);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/email/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ marketing: checked }),
      });

      if (response.ok) {
        toast({
          title: 'Preferences updated',
          description: checked
            ? 'You will now receive marketing emails.'
            : 'You have unsubscribed from marketing emails.',
        });
      } else {
        // Revert on error
        setMarketingEmails(!checked);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update email preferences.',
        });
      }
    } catch (error) {
      // Revert on error
      setMarketingEmails(!checked);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update email preferences.',
      });
    } finally {
      setSavingPreferences(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <h1 className="font-headline text-lg font-semibold md:text-2xl">
          Settings
        </h1>
      </div>
      <div className="grid w-full max-w-4xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={user?.displayName ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email ?? ''} />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>

        <SubscriptionManager 
            currentTier={userPlan}
            backupsThisMonth={1}
            lastBackupDate={new Date()}
        />

        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>
                Manage your team members and settings. This feature is only available on the Business plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild disabled={!isBusinessPlan}>
                <Link href="/dashboard/team">Manage Team</Link>
            </Button>
             {!isBusinessPlan && (
              <p className="mt-2 text-sm text-muted-foreground">
                Upgrade to the Business plan to unlock team features.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>
              Customize the look and feel of the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="theme-mode">Theme Mode</Label>
                    <p className="text-sm text-muted-foreground">
                        Toggle between light and dark mode.
                    </p>
                </div>
                <Select defaultValue="system">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Preferences
            </CardTitle>
            <CardDescription>
              Manage the types of emails you receive from LinkStream.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-emails" className="font-medium">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features, tips, and special offers.
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={marketingEmails}
                onCheckedChange={handleMarketingEmailsChange}
                disabled={loadingPreferences || savingPreferences}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> You'll always receive important account notifications,
                security alerts, backup reminders, and billing information regardless of this setting.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Manage your account and data preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete All Data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all of your uploaded LinkedIn data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="mt-2 text-sm text-muted-foreground">
              Permanently remove all your data from our platform.
            </p>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="flex gap-4 justify-center p-4 border-t">
          <Link href="/privacy" className="text-muted-foreground text-sm hover:text-primary">
            Privacy Policy
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/terms" className="text-muted-foreground text-sm hover:text-primary">
            Terms of Service
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/contact" className="text-muted-foreground text-sm hover:text-primary">
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
