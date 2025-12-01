'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Crown, 
  Calendar, 
  Bell, 
  Check, 
  Download,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionTier, getUserTierLimits, canUserCreateBackup } from '@/lib/subscription-tiers';

interface SubscriptionManagerProps {
  currentTier: SubscriptionTier;
  backupsThisMonth: number;
  lastBackupDate?: Date;
  onTierChange?: (tier: SubscriptionTier) => void;
}

export function SubscriptionManager({ 
  currentTier, 
  backupsThisMonth, 
  lastBackupDate,
  onTierChange 
}: SubscriptionManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [calendarIntegrationEnabled, setCalendarIntegrationEnabled] = useState(false);
  const [reminderSettings, setReminderSettings] = useState(null);

  const tierLimits = getUserTierLimits(currentTier);
  const canBackup = canUserCreateBackup(currentTier, backupsThisMonth);
  
  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pro': return 'text-green-600 bg-green-50 border-green-200';
      case 'business': return 'text-purple-600 bg-purple-50 border-purple-200';
    }
  };

  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free': return <Shield className="h-4 w-4" />;
      case 'pro': return <Zap className="h-4 w-4" />;
      case 'business': return <Crown className="h-4 w-4" />;
    }
  };

  const setupCalendarReminders = async () => {
    try {
      if (!tierLimits.calendarIntegration) {
        toast({
          title: "Upgrade Required",
          description: "Calendar integration is available for Pro and Business plans.",
          variant: "destructive",
        });
        return;
      }

      // Start Google Calendar OAuth flow
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/dashboard/settings`;
      const scope = 'https://www.googleapis.com/auth/calendar.events';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        new URLSearchParams({
          client_id: clientId!,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: scope,
          access_type: 'offline',
          prompt: 'consent'
        });

      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Calendar setup error:', error);
      toast({
        title: "Setup failed",
        description: "Could not setup calendar integration.",
        variant: "destructive",
      });
    }
  };

  const setupEmailReminders = async () => {
    try {
      const response = await fetch('/api/reminders/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          tier: currentTier,
          lastBackupDate: lastBackupDate,
          userEmail: user?.email,
          calendarIntegration: null // Email only
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Reminders setup!",
          description: "You'll receive email reminders based on your plan.",
        });
      }
    } catch (error) {
      console.error('Email reminder setup error:', error);
      toast({
        title: "Setup failed",
        description: "Could not setup email reminders.",
        variant: "destructive",
      });
    }
  };

  const downloadICSFile = async () => {
    try {
      const response = await fetch('/api/reminders/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          tier: currentTier,
          lastBackupDate: lastBackupDate,
          userEmail: user?.email,
        }),
      });

      const result = await response.json();

      if (result.success && result.icsFile) {
        const blob = new Blob([result.icsFile], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'linkedin_backup_reminder.ics';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast({
            title: "ICS File Downloaded",
            description: "Import the file into your calendar.",
        });
      } else {
        throw new Error(result.error || 'Failed to generate ICS file');
      }
    } catch (error: any) {
      console.error('ICS download error:', error);
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
            <span>Subscription & Reminders</span>
            <Badge className={getTierColor(currentTier)}>
                {getTierIcon(currentTier)}
                {tierLimits.name}
            </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <h4 className="font-medium">Backup Status</h4>
            <div className={`p-3 rounded-md flex items-center gap-3 ${canBackup ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                {canBackup ? <Check className="h-5 w-5"/> : <Clock className="h-5 w-5"/>}
                <div>
                    <p className="font-medium">
                        {canBackup 
                            ? `You can create ${tierLimits.backupsPerMonth === -1 ? 'unlimited' : tierLimits.backupsPerMonth - backupsThisMonth} more backups this month.`
                            : `You have reached your ${tierLimits.backupFrequency} limit.`
                        }
                    </p>
                    {lastBackupDate && <p className="text-xs">Last backup: {lastBackupDate.toLocaleDateString()}</p>}
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="font-medium">Reminder Settings</h4>
            <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Email Reminders</p>
                        <p className="text-xs text-muted-foreground">Get notified before your next backup is due.</p>
                    </div>
                </div>
                <Button size="sm" onClick={setupEmailReminders}>Setup</Button>
            </div>
             <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Google Calendar</p>
                        <p className="text-xs text-muted-foreground">Automatically add reminders to your calendar.</p>
                    </div>
                </div>
                <Button size="sm" onClick={setupCalendarReminders} disabled={!tierLimits.calendarIntegration}>
                    {tierLimits.calendarIntegration ? 'Connect' : 'Upgrade'}
                </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Manual Download (.ics)</p>
                        <p className="text-xs text-muted-foreground">Download a file for any calendar app.</p>
                    </div>
                </div>
                <Button size="sm" variant="outline" onClick={downloadICSFile}>Download</Button>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
