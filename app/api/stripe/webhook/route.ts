import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/config/stripe-server';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripeServer();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const uid = session.metadata?.uid;
      const plan = session.metadata?.plan ?? 'basic';

      if (uid) {
        // Tenant creation is handled in onboarding after redirect.
        // Store Stripe customer ID for later use.
        console.log(
          `[Stripe] Checkout completed: uid=${uid}, plan=${plan}, customer=${session.customer}`
        );
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      console.log(
        `[Stripe] Subscription ${event.type}: ${sub.id}, status=${sub.status}`
      );
      // TODO: Update tenant subscription status in Firestore
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
