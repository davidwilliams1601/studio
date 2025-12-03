
export type SubscriptionTier = 'free' | 'pro' | 'business' | 'enterprise';

export interface TierLimits {
  tier: SubscriptionTier;
  name: string;
  backupsPerMonth: number;
  backupFrequency: 'monthly' | 'weekly' | 'unlimited';
  reminderDays: number[];
  features: string[];
  price: number;
  priceLabel?: string;
  maxTeamMembers: number;
  calendarIntegration: boolean;
  aiInsights: 'basic' | 'advanced' | 'premium';
  networkAnalysis: boolean;
  strategicRecommendations: boolean;
  teamFeatures: boolean;
  auditLogs: boolean;
  ssoIntegration: boolean;
  apiAccess: boolean;
  exportFormats: string[];
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierLimits> = {
  free: {
    tier: 'free',
    name: 'Free',
    backupsPerMonth: 1,
    backupFrequency: 'monthly',
    reminderDays: [30, 7, 1],
    features: [
      '1 backup per month',
      'Basic AI insights',
      'Profile completeness score',
      'Standard dashboard',
      'CSV export'
    ],
    price: 0,
    maxTeamMembers: 1,
    calendarIntegration: false,
    aiInsights: 'basic',
    networkAnalysis: false,
    strategicRecommendations: false,
    teamFeatures: false,
    auditLogs: false,
    ssoIntegration: false,
    apiAccess: false,
    exportFormats: ['csv']
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    backupsPerMonth: 4,
    backupFrequency: 'weekly',
    reminderDays: [7, 3, 1],
    features: [
      'Weekly backups',
      'Advanced AI insights',
      'Network analysis',
      'Connection trends',
      'Strategic recommendations',
      'Calendar integration',
      'Multiple export formats',
      'Priority support'
    ],
    price: 10,
    maxTeamMembers: 1,
    calendarIntegration: true,
    aiInsights: 'advanced',
    networkAnalysis: true,
    strategicRecommendations: true,
    teamFeatures: false,
    auditLogs: false,
    ssoIntegration: false,
    apiAccess: false,
    exportFormats: ['csv', 'json', 'pdf']
  },
  business: {
    tier: 'business',
    name: 'Business',
    backupsPerMonth: -1, // unlimited per user
    backupFrequency: 'unlimited',
    reminderDays: [7, 3],
    features: [
      'Everything in Pro',
      'Unlimited backups per user',
      'Team management (up to 10 members)',
      'Shared team analytics',
      'Centralized backup management',
      'Team admin controls',
      'Premium AI insights',
      'Priority support'
    ],
    price: 29,
    priceLabel: '/month',
    maxTeamMembers: 10,
    calendarIntegration: true,
    aiInsights: 'premium',
    networkAnalysis: true,
    strategicRecommendations: true,
    teamFeatures: true,
    auditLogs: true,
    ssoIntegration: false,
    apiAccess: false,
    exportFormats: ['csv', 'json', 'pdf', 'excel']
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    backupsPerMonth: -1,
    backupFrequency: 'unlimited',
    reminderDays: [7, 3],
    features: [
      'Everything in Business',
      'Unlimited team members',
      'SSO integration',
      'Custom retention policies',
      'Audit logs & compliance',
      'API access',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantees',
      'White-label options'
    ],
    price: 0, // Custom pricing
    priceLabel: 'Custom',
    maxTeamMembers: -1, // unlimited
    calendarIntegration: true,
    aiInsights: 'premium',
    networkAnalysis: true,
    strategicRecommendations: true,
    teamFeatures: true,
    auditLogs: true,
    ssoIntegration: true,
    apiAccess: true,
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
