import type { PlanTier } from '@/types/magazine';

export interface PlanConfig {
  tier: PlanTier;
  name: string;
  pageCount: number;
  priceMonthly: number;    // in dollars
  stripePriceId: string;
  features: string[];
  popular?: boolean;
}

export const PLANS: Record<'basic' | 'pro', PlanConfig> = {
  basic: {
    tier: 'basic',
    name: 'Basic',
    pageCount: 12,
    priceMonthly: 49,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID ?? '',
    features: [
      '12-page digital magazine',
      'AI-generated business articles',
      'SEO-optimized content',
      'Shareable flipbook link',
      'Monthly publication',
      'Email delivery',
    ],
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    pageCount: 24,
    priceMonthly: 99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? '',
    features: [
      '24-page digital magazine',
      'AI-generated business articles',
      'SEO-optimized content',
      'Shareable flipbook link',
      'Monthly publication',
      'Email delivery',
      'Ad slot support',
      'Brand customization',
      'PDF export',
    ],
    popular: true,
  },
};

export const PLAN_LIST = Object.values(PLANS);