// src/lib/stripe-admin.ts
import Stripe from 'stripe';

// Initialize Stripe with secret key
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia' as any,
  });
};

/**
 * Cancel a Stripe subscription
 * @param subscriptionId - Stripe subscription ID
 * @param cancelImmediately - If true, cancels immediately. If false, cancels at period end
 * @returns The updated or cancelled subscription
 */
export async function cancelStripeSubscription(
  subscriptionId: string,
  cancelImmediately: boolean = false
): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  try {
    if (cancelImmediately) {
      // Cancel immediately
      console.log(`Cancelling subscription ${subscriptionId} immediately`);
      return await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at period end
      console.log(`Setting subscription ${subscriptionId} to cancel at period end`);
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  } catch (error: any) {
    console.error('Stripe subscription cancellation error:', error);
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }
}

/**
 * Reactivate a cancelled subscription (remove cancel_at_period_end flag)
 */
export async function reactivateStripeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  try {
    console.log(`Reactivating subscription ${subscriptionId}`);
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  } catch (error: any) {
    console.error('Stripe subscription reactivation error:', error);
    throw new Error(`Failed to reactivate subscription: ${error.message}`);
  }
}

/**
 * Get detailed subscription information
 * @param subscriptionId - Stripe subscription ID
 * @returns Subscription with expanded customer and invoice data
 */
export async function getSubscriptionDetails(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  try {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'latest_invoice', 'default_payment_method'],
    });
  } catch (error: any) {
    console.error('Failed to fetch subscription details:', error);
    throw new Error(`Failed to fetch subscription: ${error.message}`);
  }
}

/**
 * Update subscription to a different tier/price
 * @param subscriptionId - Stripe subscription ID
 * @param newPriceId - New Stripe price ID
 * @returns Updated subscription
 */
export async function updateSubscriptionTier(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    console.log(`Updating subscription ${subscriptionId} to price ${newPriceId}`);

    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'always_invoice', // Pro-rate and invoice immediately
    });
  } catch (error: any) {
    console.error('Stripe subscription update error:', error);
    throw new Error(`Failed to update subscription tier: ${error.message}`);
  }
}

/**
 * Get customer information from Stripe
 */
export async function getCustomerDetails(
  customerId: string
): Promise<Stripe.Customer> {
  const stripe = getStripe();

  try {
    return await stripe.customers.retrieve(customerId) as Stripe.Customer;
  } catch (error: any) {
    console.error('Failed to fetch customer details:', error);
    throw new Error(`Failed to fetch customer: ${error.message}`);
  }
}

/**
 * List all active subscriptions (for MRR calculation)
 * @returns Array of active subscriptions
 */
export async function listActiveSubscriptions(): Promise<Stripe.Subscription[]> {
  const stripe = getStripe();

  try {
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
    });

    return subscriptions.data;
  } catch (error: any) {
    console.error('Failed to list subscriptions:', error);
    throw new Error(`Failed to list subscriptions: ${error.message}`);
  }
}
