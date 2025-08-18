
export type SubscriptionTier = 'free' | 'pro' | 'business';

export interface TierLimits {
  tier: SubscriptionTier;
  name: string;
  backupsPerMonth: number;
  backupFrequency: 'monthly' | 'weekly' | 'unlimited';
  reminderDays: number[];
  features: string[];
  price: number;
  calendarIntegration: boolean;
  aiInsights: 'basic' | 'advanced' | 'premium';
  networkAnalysis: boolean;
  strategicRecommendations: boolean;
  exportFormats: string[];
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierLimits> = {
  free: {
    tier: 'free',
    name: 'Free',
    backupsPerMonth: 1,
    backupFrequency: 'monthly',
    reminderDays: [30, 7, 1], // 30 days, 7 days, 1 day before
    features: [
      '1 backup per month',
      'Basic AI insights',
      'Standard dashboard',
      'CSV export'
    ],
    price: 0,
    calendarIntegration: false,
    aiInsights: 'basic',
    networkAnalysis: false,
    strategicRecommendations: false,
    exportFormats: ['csv']
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    backupsPerMonth: 4,
    backupFrequency: 'weekly',
    reminderDays: [7, 3, 1], // 7 days, 3 days, 1 day before
    features: [
      'Weekly backups',
      'Advanced AI insights',
      'Network intelligence',
      'Strategic recommendations',
      'Calendar integration',
      'Multiple export formats',
      'Priority support'
    ],
    price: 8,
    calendarIntegration: true,
    aiInsights: 'advanced',
    networkAnalysis: true,
    strategicRecommendations: true,
    exportFormats: ['csv', 'json', 'pdf']
  },
  business: {
    tier: 'business',
    name: 'Business',
    backupsPerMonth: -1, // unlimited
    backupFrequency: 'unlimited',
    reminderDays: [7, 3], // More frequent, less nagging
    features: [
      'Unlimited backups',
      'Premium AI insights',
      'Advanced network analysis',
      'Strategic action plans',
      'Calendar integration',
      'Team features',
      'API access (coming soon)',
      'Custom reports',
      'Priority support'
    ],
    price: 15,
    calendarIntegration: true,
    aiInsights: 'premium',
    networkAnalysis: true,
    strategicRecommendations: true,
    exportFormats: ['csv', 'json', 'pdf', 'excel']
  }
};

export const getUserTierLimits = (tier: SubscriptionTier): TierLimits => {
  return SUBSCRIPTION_TIERS[tier];
};

export const canUserCreateBackup = (
  tier: SubscriptionTier, 
  backupsThisMonth: number
): boolean => {
  const limits = getUserTierLimits(tier);
  if (limits.backupsPerMonth === -1) return true; // unlimited
  return backupsThisMonth < limits.backupsPerMonth;
};

export const getNextReminderDate = (
  tier: SubscriptionTier,
  lastBackupDate: Date
): Date => {
  const limits = getUserTierLimits(tier);
  const now = new Date();
  
  switch (limits.backupFrequency) {
    case 'weekly':
      const nextWeek = new Date(lastBackupDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    
    case 'monthly':
      const nextMonth = new Date(lastBackupDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    
    case 'unlimited':
      // For business tier, suggest monthly but allow anytime
      const suggestedDate = new Date(lastBackupDate);
      suggestedDate.setMonth(suggestedDate.getMonth() + 1);
      return suggestedDate;
    
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
};

export const shouldSendReminder = (
  tier: SubscriptionTier,
  lastBackupDate: Date,
  lastReminderSent?: Date
): { shouldSend: boolean; reminderType: string } => {
  const limits = getUserTierLimits(tier);
  const nextBackupDate = getNextReminderDate(tier, lastBackupDate);
  const now = new Date();
  const daysUntilBackup = Math.ceil((nextBackupDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Check if we should send a reminder based on tier settings
  for (const reminderDay of limits.reminderDays) {
    if (daysUntilBackup === reminderDay) {
      // Check if we haven't sent this reminder already
      if (!lastReminderSent || 
          lastReminderSent.toDateString() !== now.toDateString()) {
        return {
          shouldSend: true,
          reminderType: reminderDay === 1 ? 'urgent' : 
                       reminderDay <= 3 ? 'soon' : 'upcoming'
        };
      }
    }
  }
  
  // Check if backup is overdue
  if (daysUntilBackup < 0) {
    const daysOverdue = Math.abs(daysUntilBackup);
    if (daysOverdue % 7 === 0) { // Weekly reminders for overdue
      return {
        shouldSend: true,
        reminderType: 'overdue'
      };
    }
  }
  
  return { shouldSend: false, reminderType: '' };
};
