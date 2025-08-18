// Basic Stripe integration without npm packages
export class StripeClient {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async createCheckoutSession(params: any) {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'mode': 'subscription',
        'line_items[0][price]': params.priceId,
        'line_items[0][quantity]': '1',
        'success_url': params.successUrl,
        'cancel_url': params.cancelUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Stripe API error: ${response.status}`);
    }

    return response.json();
  }
}

export const stripe = new StripeClient(process.env.STRIPE_SECRET_KEY || '');
