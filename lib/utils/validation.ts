import { z } from 'zod/v4';

/** Validate a URL string */
export const urlSchema = z.url();

/** Validate email */
export const emailSchema = z.email();

/** Validate onboarding input */
export const onboardingSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessUrl: z.string().url('Please enter a valid URL'),
  email: z.string().email('Please enter a valid email'),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  tagline: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'authoritative']).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

/** Validate generate issue request */
export const generateIssueSchema = z.object({
  tenantId: z.string().min(1),
  businessUrl: z.string().url(),
  businessName: z.string().min(1),
  plan: z.enum(['basic', 'pro', 'custom']),
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM'),
});

/** Get current year-month string */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}