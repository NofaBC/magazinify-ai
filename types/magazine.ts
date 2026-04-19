/** Core magazine and issue types for Magazinify AI™ */

export type PlanTier = 'basic' | 'pro' | 'custom';
export type IssueStatus = 'draft' | 'generating' | 'published' | 'failed';
export type PageType = 'cover' | 'toc' | 'article' | 'ad' | 'back-cover';
export type PublicationFrequency = 'monthly' | 'weekly'; // weekly = internal NOFA only

/** Single page within a magazine issue */
export interface MagazinePage {
  pageNumber: number;
  type: PageType;
  title: string;
  content: string;       // HTML content for the page
  imageUrl?: string;
  imageAlt?: string;
  seoKeywords?: string[];
}

/** Ad slot within a magazine */
export interface AdSlot {
  slotId: string;
  pageNumber: number;
  position: 'full-page' | 'half-page' | 'banner';
  imageUrl?: string;
  linkUrl?: string;
  advertiserName?: string;
  isDefault: boolean;     // true = client's own business ad
}

/** Article metadata for dedup tracking */
export interface ArticleIndex {
  title: string;
  topic: string;
  angle: string;
  keywords: string[];
}

/** A single magazine issue */
export interface MagazineIssue {
  id: string;
  tenantId: string;
  yearMonth: string;         // e.g. "2026-04"
  status: IssueStatus;
  plan: PlanTier;
  pageCount: number;         // 12 or 24
  pages: MagazinePage[];
  adSlots: AdSlot[];
  articleIndex: ArticleIndex[];  // for dedup across months
  frequency: PublicationFrequency;
  businessName: string;
  businessUrl: string;
  createdAt: string;
  publishedAt?: string;
  shareableUrl?: string;
}

/** Input for triggering magazine generation */
export interface GenerateIssueRequest {
  tenantId: string;
  businessUrl: string;
  businessName: string;
  plan: PlanTier;
  yearMonth: string;
  brandPreferences?: BrandPreferences;
  adSlots?: Partial<AdSlot>[];
}

/** Brand customization preferences */
export interface BrandPreferences {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  tagline?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'authoritative';
}

/** Scraped business data from URL */
export interface ScrapedBusinessData {
  title: string;
  description: string;
  headings: string[];
  paragraphs: string[];
  images: string[];
  links: string[];
  keywords: string[];
  rawText: string;
}