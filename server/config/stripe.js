/**
 * Stripe Payment Configuration
 * 
 * This file sets up the Stripe client for handling subscriptions and payments.
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const dotenv = require('dotenv');
const { firestore } = require('./firebase');

dotenv.config();

// Check if Stripe key is configured
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality will be limited.');
}

// Stripe product IDs from environment variables
const PRODUCTS = {
  BASIC_PLAN: process.env.STRIPE_BASIC_PLAN_ID,
  PRO_PLAN: process.env.STRIPE_PRO_PLAN_ID,
  CUSTOM_PLAN: process.env.STRIPE_CUSTOM_PLAN_ID,
};

/**
 * Create a checkout session for a new subscription
 * 
 * @param {string} planType - Type of plan (basic, pro, custom)
 * @param {string} tenantId - Tenant ID
 * @param {string} customerEmail - Customer email
 * @returns {Promise<Object>} - Checkout session
 */
async function createCheckoutSession(planType, tenantId, customerEmail) {
  try {
    let priceId;
    
    // Determine which price to use
    switch (planType.toLowerCase()) {
      case 'basic':
        priceId = PRODUCTS.BASIC_PLAN;
        break;
      case 'pro':
        priceId = PRODUCTS.PRO_PLAN;
        break;
      case 'custom':
        priceId = PRODUCTS.CUSTOM_PLAN;
        break;
      default:
        throw new Error('Invalid plan type');
    }
    
    if (!priceId) {
      throw new Error(`Price ID for plan ${planType} not found`);
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      customer_email: customerEmail,
      metadata: {
        tenantId,
        planType,
      },
      subscription_data: {
        metadata: {
          tenantId,
        },
      },
    });
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Handle a successful subscription creation
 * 
 * @param {Object} subscription - Stripe subscription object
 * @returns {Promise<void>}
 */
async function handleSubscriptionCreated(subscription) {
  try {
    const { tenantId } = subscription.metadata;
    
    if (!tenantId) {
      throw new Error('No tenant ID found in subscription metadata');
    }
    
    // Update tenant record with subscription info
    await firestore.collection('tenants').doc(tenantId).update({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planType: subscription.metadata.planType,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        createdAt: new Date(subscription.created * 1000),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw new Error('Failed to handle subscription created');
  }
}

/**
 * Handle a subscription update
 * 
 * @param {Object} subscription - Stripe subscription object
 * @returns {Promise<void>}
 */
async function handleSubscriptionUpdated(subscription) {
  try {
    const { tenantId } = subscription.metadata;
    
    if (!tenantId) {
      throw new Error('No tenant ID found in subscription metadata');
    }
    
    // Update tenant record with subscription info
    await firestore.collection('tenants').doc(tenantId).update({
      'subscription.status': subscription.status,
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
      'subscription.updatedAt': new Date(),
    });
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw new Error('Failed to handle subscription updated');
  }
}

/**
 * Cancel a subscription
 * 
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} - Updated subscription
 */
async function cancelSubscription(subscriptionId) {
  try {
    return await stripe.subscriptions.del(subscriptionId);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Get subscription details
 * 
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} - Subscription details
 */
async function getSubscriptionDetails(subscriptionId) {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw new Error('Failed to retrieve subscription details');
  }
}

module.exports = {
  stripe,
  PRODUCTS,
  createCheckoutSession,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  cancelSubscription,
  getSubscriptionDetails,
};
