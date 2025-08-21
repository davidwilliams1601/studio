import { SUBSCRIPTION_TIERS, type SubscriptionTier } from "@/lib/subscription-tiers";

export function getTierLimits(tier: SubscriptionTier) {
  return SUBSCRIPTION_TIERS[tier];
}

export function canCreateBackupForTier(tier: SubscriptionTier, backupsThisMonth: number) {
  const limits = SUBSCRIPTION_TIERS[tier];
  if (limits.backupsPerMonth === -1) return true;
  return backupsThisMonth < limits.backupsPerMonth;
}
