import { getOpenAI, AI_MODEL, MAX_ARTICLE_TOKENS } from '@/lib/config/ai';
import { scrapeBusinessUrl } from './website-scraper';
import { generateArticleImage, generateCoverImage } from './image-gen';
import { getPreviousArticleIndicesAdmin } from './firestore-admin';
import { logger } from '@/lib/utils/logger';
import type {
  MagazineIssue,
  MagazinePage,
  AdSlot,
  ArticleIndex,
  GenerateIssueRequest,
  ScrapedBusinessData,
  BrandPreferences,
} from '@/types/magazine';

// ── Main generation pipeline ──────────────────────────────

export async function generateMagazineIssue(
  request: GenerateIssueRequest
): Promise<MagazineIssue> {
  const {
    tenantId,
    businessUrl,
    businessName,
    plan,
    yearMonth,
    brandPreferences,
  } = request;

  const pageCount = plan === 'pro' ? 24 : 12;
  // Basic: cover + TOC + back cover = 3 fixed pages, rest are articles
  // Pro: same fixed pages + ad slots at strategic positions
  const articleCount = plan === 'pro' ? 18 : 9;

  logger.info('Starting magazine generation', { tenantId, yearMonth, plan });

  // 1. Scrape business website
  const scraped = await scrapeBusinessUrl(businessUrl);

  // 2. Fetch previous article indices for dedup (Admin SDK)
  const previousArticles = await getPreviousArticleIndicesAdmin(tenantId, 6);

  // 3. Generate articles via AI
  const articles = await generateAllArticles(
    businessName,
    businessUrl,
    scraped,
    previousArticles,
    articleCount,
    brandPreferences
  );

  // 4. Generate cover image
  const coverImageUrl = await generateCoverImage(businessName, yearMonth);

  // 5. Assemble pages
  const pages = assemblePages(
    businessName,
    yearMonth,
    articles,
    coverImageUrl,
    pageCount,
    brandPreferences
  );

  // 6. Build article index for future dedup
  const articleIndex: ArticleIndex[] = articles.map((a) => ({
    title: a.title,
    topic: a.topic,
    angle: a.angle,
    keywords: a.keywords,
  }));

  // 7. Build ad slots (Pro only)
  const adSlots: AdSlot[] = plan === 'pro'
    ? buildDefaultAdSlots(businessName, businessUrl, pageCount)
    : [];

  const issue: MagazineIssue = {
    id: `${tenantId}_${yearMonth}`,
    tenantId,
    yearMonth,
    status: 'published',
    plan,
    pageCount,
    pages,
    adSlots,
    articleIndex,
    frequency: 'monthly',
    businessName,
    businessUrl,
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  };

  logger.info('Magazine generation complete', { tenantId, yearMonth, pageCount: pages.length });
  return issue;
}

// ── Article generation ────────────────────────────────────

interface GeneratedArticle {
  title: string;
  topic: string;
  angle: string;
  keywords: string[];
  content: string;         // HTML content
  imagePrompt: string;
  imageUrl?: string;
  isMainArticle: boolean;
}

async function generateAllArticles(
  businessName: string,
  businessUrl: string,
  scraped: ScrapedBusinessData,
  previousArticles: ArticleIndex[],
  count: number,
  brandPreferences?: BrandPreferences
): Promise<GeneratedArticle[]> {
  // Build exclusion list from previous issues
  const exclusionList = previousArticles
    .map((a) => `- "${a.title}" (topic: ${a.topic}, angle: ${a.angle})`)
    .join('\n');

  const businessContext = [
    `Business: ${businessName}`,
    `URL: ${businessUrl}`,
    scraped.title && `Website title: ${scraped.title}`,
    scraped.description && `Description: ${scraped.description}`,
    scraped.headings.length > 0 &&
      `Key headings: ${scraped.headings.slice(0, 10).join(', ')}`,
    scraped.paragraphs.length > 0 &&
      `Content excerpt: ${scraped.paragraphs.slice(0, 5).join(' ').slice(0, 1000)}`,
    scraped.keywords.length > 0 &&
      `Keywords: ${scraped.keywords.join(', ')}`,
    brandPreferences?.tone && `Brand tone: ${brandPreferences.tone}`,
  ]
    .filter(Boolean)
    .join('\n');

  // Generate main business article
  const mainArticle = await generateArticle(
    businessContext,
    exclusionList,
    businessName,
    true
  );

  // Generate supporting articles
  const supportingArticles: GeneratedArticle[] = [];
  for (let i = 0; i < count - 1; i++) {
    // Include already-generated titles in exclusion to avoid intra-issue dupes
    const intraExclusion = [
      mainArticle.title,
      ...supportingArticles.map((a) => a.title),
    ]
      .map((t) => `- "${t}"`)
      .join('\n');

    const combined = exclusionList
      ? `${exclusionList}\n${intraExclusion}`
      : intraExclusion;

    const article = await generateArticle(
      businessContext,
      combined,
      businessName,
      false
    );
    supportingArticles.push(article);
  }

  // Generate images for articles (in parallel, limit to save cost)
  const allArticles = [mainArticle, ...supportingArticles];
  const articlesForImages = allArticles.slice(0, 4); // Max 4 images per issue
  await Promise.all(
    articlesForImages.map(async (article) => {
      article.imageUrl = (await generateArticleImage(article.imagePrompt)) ?? undefined;
    })
  );

  return allArticles;
}

async function generateArticle(
  businessContext: string,
  exclusionList: string,
  businessName: string,
  isMain: boolean
): Promise<GeneratedArticle> {
  const systemPrompt = isMain
    ? `You are an editorial writer for a professional digital magazine. Write a feature article about the business. The article should introduce the business, highlight its strengths, products/services, and include a clear call to action back to the business website. Write in HTML format (use <h2>, <p>, <strong>, <em>, <ul>, <li> tags). Make it engaging, informative, and SEO-friendly.`
    : `You are an editorial writer for a professional digital magazine. Write a supporting article related to the business's industry, products, or services. The article should be educational, informative, and topically connected to what the business offers. Do NOT write directly about the business — write about topics that support and complement it. Write in HTML format (use <h2>, <p>, <strong>, <em>, <ul>, <li> tags). Make it SEO-friendly.`;

  const userPrompt = `Business context:
${businessContext}

${exclusionList ? `IMPORTANT: Do NOT reuse or closely paraphrase any of these previous article titles, topics, or angles:
${exclusionList}

Generate completely fresh content with new angles.\n` : ''}
Respond with valid JSON only:
{
  "title": "Article title",
  "topic": "One-line topic summary",
  "angle": "The specific angle or perspective",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "content": "<h2>Title</h2><p>Article body in HTML...</p>",
  "imagePrompt": "A short description for generating a relevant editorial image"
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: MAX_ARTICLE_TOKENS,
      temperature: 0.85,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);

    return {
      title: parsed.title ?? 'Untitled Article',
      topic: parsed.topic ?? '',
      angle: parsed.angle ?? '',
      keywords: parsed.keywords ?? [],
      content: parsed.content ?? '<p>Content unavailable.</p>',
      imagePrompt: parsed.imagePrompt ?? `${businessName} business`,
      isMainArticle: isMain,
    };
  } catch (err) {
    logger.error('Article generation failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      title: isMain ? `About ${businessName}` : 'Feature Article',
      topic: businessName,
      angle: 'general',
      keywords: [],
      content: `<p>Content generation is temporarily unavailable. Please try again later.</p>`,
      imagePrompt: `${businessName} business`,
      isMainArticle: isMain,
    };
  }
}

// ── Page assembly ─────────────────────────────────────────

function assemblePages(
  businessName: string,
  yearMonth: string,
  articles: GeneratedArticle[],
  coverImageUrl: string | null,
  targetPageCount: number,
  brandPreferences?: BrandPreferences
): MagazinePage[] {
  const pages: MagazinePage[] = [];
  const [year, month] = yearMonth.split('-');
  const monthName = new Date(Number(year), Number(month) - 1).toLocaleString(
    'en-US',
    { month: 'long' }
  );
  const brandColor = brandPreferences?.primaryColor ?? '#171717';

  // Page 1: Cover
  pages.push({
    pageNumber: 1,
    type: 'cover',
    title: businessName,
    content: `
      <div style="text-align:center; padding:2rem;">
        ${coverImageUrl ? `<img src="${coverImageUrl}" alt="${businessName} Magazine Cover" style="max-width:100%; border-radius:8px;" />` : ''}
        <h1 style="font-size:2rem; margin-top:1.5rem; color:${brandColor};">${businessName}</h1>
        <p style="font-size:1.1rem; color:#666;">${monthName} ${year} Edition</p>
        ${brandPreferences?.tagline ? `<p style="font-style:italic; color:#888;">${brandPreferences.tagline}</p>` : ''}
      </div>
    `,
    imageUrl: coverImageUrl ?? undefined,
  });

  // Page 2: Table of Contents
  const tocItems = articles
    .map((a, i) => `<li style="margin-bottom:0.5rem;"><strong>${a.title}</strong></li>`)
    .join('');
  pages.push({
    pageNumber: 2,
    type: 'toc',
    title: 'In This Issue',
    content: `
      <h2 style="color:${brandColor}; margin-bottom:1rem;">In This Issue</h2>
      <ol style="line-height:1.8;">${tocItems}</ol>
    `,
  });

  // Article pages
  articles.forEach((article) => {
    pages.push({
      pageNumber: pages.length + 1,
      type: 'article',
      title: article.title,
      content: `
        ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}" style="width:100%; max-height:300px; object-fit:cover; border-radius:8px; margin-bottom:1rem;" />` : ''}
        <div>${article.content}</div>
        ${article.isMainArticle ? `<p style="margin-top:1rem;"><a href="${businessName}" style="color:${brandColor}; font-weight:600;">Visit ${businessName} →</a></p>` : ''}
      `,
      imageUrl: article.imageUrl,
      seoKeywords: article.keywords,
    });
  });

  // Pro only: fill remaining pages with ad placeholders if needed
  if (targetPageCount >= 24) {
    while (pages.length < targetPageCount - 1) {
      pages.push({
        pageNumber: pages.length + 1,
        type: 'ad',
        title: 'Advertisement',
        content: `
          <div style="text-align:center; padding:3rem 2rem; background:#f9f9f9; border-radius:8px;">
            <p style="font-size:0.9rem; color:#999;">Advertisement Space</p>
            <p style="font-size:0.8rem; color:#bbb;">Contact us for advertising opportunities</p>
          </div>
        `,
      });
    }
  }

  // Last page: Back cover
  pages.push({
    pageNumber: pages.length + 1,
    type: 'back-cover',
    title: 'Back Cover',
    content: `
      <div style="text-align:center; padding:3rem 2rem;">
        <h2 style="color:${brandColor};">${businessName}</h2>
        ${brandPreferences?.tagline ? `<p style="color:#666;">${brandPreferences.tagline}</p>` : ''}
        <p style="margin-top:2rem; font-size:0.8rem; color:#999;">Powered by Magazinify AI™ — A NOFA AI Factory™ Product</p>
      </div>
    `,
  });

  return pages;
}

// ── Ad slots ──────────────────────────────────────────────

function buildDefaultAdSlots(
  businessName: string,
  businessUrl: string,
  pageCount: number
): AdSlot[] {
  const slots: AdSlot[] = [];
  // Place default business ads at strategic positions
  const adPositions = pageCount >= 24 ? [6, 12, 18] : [5, 9];

  adPositions.forEach((pos, i) => {
    slots.push({
      slotId: `ad-${i + 1}`,
      pageNumber: pos,
      position: 'full-page',
      linkUrl: businessUrl,
      advertiserName: businessName,
      isDefault: true,
    });
  });

  return slots;
}