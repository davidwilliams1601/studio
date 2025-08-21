export type SubscriptionTier = "free" | "pro" | "business";

export function tierForPriceId(priceId?: string | null): SubscriptionTier | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return "business";
  return null;
}
