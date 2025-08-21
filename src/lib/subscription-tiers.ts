export type SubscriptionTier = "free" | "pro" | "business";

export const SUBSCRIPTION_TIERS: Record<
  SubscriptionTier,
  { backupsPerMonth: number }
> = {
  // -1 means “unlimited”
  free: { backupsPerMonth: 1 },
  pro: { backupsPerMonth: -1 },
  business: { backupsPerMonth: -1 },
};
