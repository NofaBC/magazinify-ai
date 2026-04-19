/** Tenant and user types for Magazinify AI™ */

import type { PlanTier, PublicationFrequency, BrandPreferences } from './magazine';

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';

/** Root tenant document — tenants/{tenantId} */
export interface Tenant {
  id: string;
  ownerId: string;              // Firebase Auth UID
  businessName: string;
  businessUrl: string;
  email: string;
  plan: PlanTier;
  frequency: PublicationFrequency;  // 'monthly' for clients, 'weekly' for NOFA internal
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  brandPreferences: BrandPreferences;
  logoUrl?: string;
  isInternal: boolean;          // true = NOFA internal tenant
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Data collected during onboarding */
export interface OnboardingData {
  businessName: string;
  businessUrl: string;
  email: string;
  logoFile?: File;
  brandPreferences: BrandPreferences;
}

/** Campaign for email delivery */
export interface Campaign {
  id: string;
  tenantId: string;
  issueId: string;
  yearMonth: string;
  subject: string;
  recipientEmail: string;
  shareableUrl: string;
  sentAt?: string;
  status: 'draft' | 'sent' | 'failed';
  createdAt: string;
}

/** Temporary asset uploaded by client */
export interface TenantAsset {
  id: string;
  tenantId: string;
  fileName: string;
  storagePath: string;
  downloadUrl: string;
  isTemporary: boolean;
  usedInIssue?: string;       // yearMonth of the issue it was used in
  createdAt: string;
}