// Deprecated server actions — kept as stubs to avoid build errors.
// We now use /api/stripe/checkout instead.

"use server";

export async function createCheckoutSessionAction(_args: { priceId: string }) {
  return { error: "Deprecated: use /api/stripe/checkout" };
}

export async function createStripePortalSessionAction(_args: { uid: string }) {
  return { error: "Not implemented: use a dedicated API route" };
}
