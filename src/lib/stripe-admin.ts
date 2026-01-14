/**
 * Stripe Admin Utilities
 * Server-side functions for managing Stripe subscriptions as an admin
 */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_API_BASE = 'https://api.stripe.com/v1';

interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        unit_amount: number;
        currency: string;
        recurring: {
          interval: string;
        };
      };
    }>;
  };
}

interface SubscriptionDetails {
  subscriptionId: string;
  customerId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  priceId: string;
  amount: number;
  currency: string;
  interval: string;
}

/**
 * Make a request to Stripe API
 */
async function stripeRequest(
  endpoint: string,
  method: string = 'GET',
  body?: Record<string, string>
): Promise<any> {
  const url = `${STRIPE_API_BASE}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  if (body && method !== 'GET') {
    options.body = new URLSearchParams(body).toString();
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stripe API error (${response.status}): ${error}`);
  }

  return response.json();
}

/**
 * Get detailed information about a Stripe subscription
 */
export async function getSubscriptionDetails(
  subscriptionId: string
): Promise<SubscriptionDetails | null> {
  try {
    const subscription: StripeSubscription = await stripeRequest(
      `/subscriptions/${subscriptionId}`
    );

    return {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      priceId: subscription.items.data[0]?.price.id || '',
      amount: subscription.items.data[0]?.price.unit_amount || 0,
      currency: subscription.items.data[0]?.price.currency || 'usd',
      interval: subscription.items.data[0]?.price.recurring.interval || 'month',
    };
  } catch (error) {
    console.error('Failed to get subscription details:', error);
    return null;
  }
}

/**
 * Cancel a Stripe subscription immediately or at period end
 */
export async function cancelStripeSubscription(
  subscriptionId: string,
  immediate: boolean = false
): Promise<{ success: boolean; message: string }> {
  try {
    if (immediate) {
      // Cancel immediately
      await stripeRequest(`/subscriptions/${subscriptionId}`, 'DELETE');
      return {
        success: true,
        message: 'Subscription canceled immediately',
      };
    } else {
      // Cancel at period end
      await stripeRequest(`/subscriptions/${subscriptionId}`, 'POST', {
        cancel_at_period_end: 'true',
      });
      return {
        success: true,
        message: 'Subscription will cancel at period end',
      };
    }
  } catch (error: any) {
    console.error('Failed to cancel subscription:', error);
    return {
      success: false,
      message: error.message || 'Failed to cancel subscription',
    };
  }
}

/**
 * Refund a Stripe charge
 */
export async function refundCharge(
  chargeId: string,
  amount?: number
): Promise<{ success: boolean; message: string; refundId?: string }> {
  try {
    const body: Record<string, string> = {
      charge: chargeId,
    };

    if (amount) {
      body.amount = amount.toString();
    }

    const refund = await stripeRequest('/refunds', 'POST', body);

    return {
      success: true,
      message: 'Refund processed successfully',
      refundId: refund.id,
    };
  } catch (error: any) {
    console.error('Failed to process refund:', error);
    return {
      success: false,
      message: error.message || 'Failed to process refund',
    };
  }
}

/**
 * Get customer's payment methods
 */
export async function getCustomerPaymentMethods(customerId: string): Promise<any[]> {
  try {
    const response = await stripeRequest(
      `/payment_methods?customer=${customerId}&type=card`
    );
    return response.data || [];
  } catch (error) {
    console.error('Failed to get payment methods:', error);
    return [];
  }
}
