import Stripe from 'stripe';

// Server-side only — lazy init to prevent build-time errors
let _stripe: Stripe | null = null;

export function getStripeServer(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
    _stripe = new Stripe(key, { typescript: true });
  }
  return _stripe;
}

// Named export for backwards compat
export { getStripeServer as stripe };
