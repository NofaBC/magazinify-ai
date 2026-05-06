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

  const subscriberAds = request.adSlots
    ?.filter((ad) => ad.imageUrl)
    .map((ad) => ({ imageUrl: ad.imageUrl!, linkUrl: ad.linkUrl, advertiserName: ad.advertiserName })) ?? [];

  const pageCount = plan === 'pro' ? 24 : 12;
  // Fixed pages: cover + TOC + back cover = 3
  // Subscriber ads take 1 page each
  // Remaining pages filled with articles (each article = 2-page spread, main = 3 pages)
  const fixedPages = 3;
  const adPages = subscriberAds.length;
  const contentPages = pageCount - fixedPages - adPages;
  // Main article = 3 pages, each supporting = 2 pages
  const supportingCount = Math.max(1, Math.floor((contentPages - 3) / 2));

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
    1 + supportingCount,
    brandPreferences
  );

  // 4. Generate images for ALL articles and persist to Firebase Storage
  const coverImageUrl = await generateCoverImage(businessName, yearMonth, tenantId);
  await Promise.all(
    articles.map(async (article, idx) => {
      const storagePath = `tenants/${tenantId}/issues/${yearMonth}/article-${idx}.png`;
      article.imageUrl = (await generateArticleImage(article.imagePrompt, storagePath)) ?? undefined;
    })
  );

  // 5. Assemble pages
  const pages = assemblePages(
    businessName,
    businessUrl,
    yearMonth,
    articles,
    coverImageUrl,
    pageCount,
    plan,
    brandPreferences,
    subscriberAds
  );

  // 6. Build article index for future dedup
  const articleIndex: ArticleIndex[] = articles.map((a) => ({
    title: a.title,
    topic: a.topic,
    angle: a.angle,
    keywords: a.keywords,
  }));

  // 7. Build ad slots from subscriber ads
  const adSlots: AdSlot[] = subscriberAds.map((ad, i) => ({
    slotId: `ad-${i + 1}`,
    pageNumber: 0,  // Actual position determined during page assembly
    position: 'full-page' as const,
    imageUrl: ad.imageUrl,
    linkUrl: ad.linkUrl,
    advertiserName: ad.advertiserName,
    isDefault: false,
  }));

  const issue: MagazineIssue = {
    id: `${tenantId}_${yearMonth}`,
    tenantId,
    yearMonth,
    status: 'published',
    plan,
    pageCount: pages.length,
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
  pullQuote: string;       // A compelling quote to feature
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
  const mainArticle = await generateArticle(businessContext, exclusionList, businessName, true);

  // Generate supporting articles
  const supportingArticles: GeneratedArticle[] = [];
  for (let i = 0; i < count - 1; i++) {
    const intraExclusion = [
      mainArticle.title,
      ...supportingArticles.map((a) => a.title),
    ].map((t) => `- "${t}"`).join('\n');

    const combined = exclusionList ? `${exclusionList}\n${intraExclusion}` : intraExclusion;
    const article = await generateArticle(businessContext, combined, businessName, false);
    supportingArticles.push(article);
  }

  return [mainArticle, ...supportingArticles];
}

async function generateArticle(
  businessContext: string,
  exclusionList: string,
  businessName: string,
  isMain: boolean
): Promise<GeneratedArticle> {
  const systemPrompt = isMain
    ? `You are a senior editorial writer for a premium professional digital magazine. Write a substantial, in-depth feature article about the business. This is a paid publication — the quality must justify a $49/month subscription.

Requirements:
- Write 800-1200 words minimum
- Start with a compelling editorial introduction (2-3 paragraphs) that draws the reader in
- Cover the business story, mission, unique value proposition, key products/services
- Use specific, vivid details — not generic marketing copy
- Include 3-4 subheadings (h3 tags) that break the article into distinct sections
- Include a "by the numbers" or key facts section if relevant
- End with a strong, specific call to action
- Write in HTML format (h2, h3, p, strong, em, ul, li, blockquote tags)
- Tone: authoritative, warm, magazine-quality editorial`
    : `You are a senior editorial writer for a premium professional digital magazine. Write a substantial, in-depth supporting article related to the business's industry. This is a paid publication — the quality must justify a $49/month subscription.

Requirements:
- Write 600-900 words minimum
- The article must be genuinely educational and insightful
- Topically connected to the business's industry but NOT a direct ad
- Include practical tips, expert insights, data points, or actionable advice
- Include 2-3 subheadings (h3 tags) for structure
- Include at least one list (tips, steps, or key points)
- Write in HTML format (h2, h3, p, strong, em, ul, li, blockquote tags)
- Tone: informative, engaging, authoritative`;

  const userPrompt = `Business context:
${businessContext}

${exclusionList ? `IMPORTANT: Do NOT reuse or closely paraphrase any of these previous titles/topics:
${exclusionList}

Generate completely fresh content.\n` : ''}
Respond with valid JSON only:
{
  "title": "Compelling article title",
  "topic": "One-line topic summary",
  "angle": "The specific angle or perspective",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "content": "<h2>Title</h2><p>Full article body in HTML with multiple sections...</p>",
  "pullQuote": "A single compelling sentence from the article that could stand alone as a featured quote",
  "imagePrompt": "Detailed description for generating a high-quality editorial photo"
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
      pullQuote: parsed.pullQuote ?? '',
      imagePrompt: parsed.imagePrompt ?? `${businessName} professional editorial photo`,
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
      pullQuote: '',
      imagePrompt: `${businessName} business`,
      isMainArticle: isMain,
    };
  }
}

// ── Page assembly (premium multi-page layouts) ─────────────

interface SubscriberAdInput {
  imageUrl: string;
  linkUrl?: string;
  advertiserName?: string;
}

function assemblePages(
  businessName: string,
  businessUrl: string,
  yearMonth: string,
  articles: GeneratedArticle[],
  coverImageUrl: string | null,
  targetPageCount: number,
  plan: string,
  brandPreferences?: BrandPreferences,
  subscriberAds: SubscriberAdInput[] = []
): MagazinePage[] {
  const pages: MagazinePage[] = [];
  const [year, month] = yearMonth.split('-');
  const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('en-US', { month: 'long' });
  const brandColor = brandPreferences?.primaryColor ?? '#171717';
  const tagline = brandPreferences?.tagline ?? '';

  // Helper to add a page
  const addPage = (type: MagazinePage['type'], title: string, content: string, imageUrl?: string, keywords?: string[]) => {
    pages.push({ pageNumber: pages.length + 1, type, title, content, imageUrl, seoKeywords: keywords });
  };

  // ===== PAGE 1: COVER =====
  addPage('cover', businessName, `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; padding:1.5rem; background:linear-gradient(180deg, ${brandColor}11 0%, white 100%);">
      ${coverImageUrl ? `<img src="${coverImageUrl}" alt="Cover" style="width:100%; max-height:55%; object-fit:cover; border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,0.12);" />` : `<div style="width:100%;height:50%;background:${brandColor}11;border-radius:12px;display:flex;align-items:center;justify-content:center;"><span style="font-size:3rem;color:${brandColor};font-weight:800;">${businessName.charAt(0)}</span></div>`}
      <h1 style="font-size:1.8rem; margin-top:1.2rem; color:${brandColor}; font-weight:800; letter-spacing:-0.02em;">${businessName}</h1>
      <div style="width:40px; height:3px; background:${brandColor}; margin:0.8rem auto;"></div>
      <p style="font-size:1rem; color:#555; font-weight:500;">${monthName} ${year}</p>
      ${tagline ? `<p style="font-size:0.85rem; color:#888; font-style:italic; margin-top:0.5rem;">${tagline}</p>` : ''}
    </div>
  `, coverImageUrl ?? undefined);

  // ===== PAGE 2: TABLE OF CONTENTS =====
  const tocHtml = articles.map((a, i) => `
    <div style="display:flex; align-items:baseline; gap:0.5rem; padding:0.6rem 0; border-bottom:1px solid #f0f0f0;">
      <span style="font-size:1.5rem; font-weight:700; color:${brandColor}; min-width:2rem;">${String(i + 1).padStart(2, '0')}</span>
      <div>
        <p style="font-weight:600; font-size:0.95rem; margin:0;">${a.title}</p>
        <p style="font-size:0.8rem; color:#888; margin:0.2rem 0 0 0;">${a.topic}</p>
      </div>
    </div>
  `).join('');

  addPage('toc', 'In This Issue', `
    <div style="padding:0.5rem;">
      <p style="text-transform:uppercase; font-size:0.7rem; letter-spacing:0.15em; color:${brandColor}; font-weight:600; margin-bottom:0.3rem;">Contents</p>
      <h2 style="font-size:1.5rem; font-weight:800; color:#111; margin-bottom:1rem;">In This Issue</h2>
      ${tocHtml}
      <div style="margin-top:1.5rem; padding:1rem; background:${brandColor}0a; border-radius:8px; border-left:3px solid ${brandColor};">
        <p style="font-size:0.8rem; color:#555; margin:0; line-height:1.5;"><strong>From the Editor:</strong> Welcome to the ${monthName} ${year} edition of <em>${businessName}</em> magazine. Each article is crafted to inform, inspire, and connect you with what matters most.</p>
      </div>
    </div>
  `);

  // ===== MAIN ARTICLE: 3-PAGE SPREAD =====
  const main = articles[0];
  if (main) {
    // Page 3: Article opener (full image + title)
    addPage('article', main.title, `
      <div style="height:100%; display:flex; flex-direction:column;">
        ${main.imageUrl ? `<img src="${main.imageUrl}" alt="${main.title}" style="width:100%; height:55%; object-fit:cover; border-radius:8px;" />` : ''}
        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; padding-top:1rem;">
          <p style="text-transform:uppercase; font-size:0.65rem; letter-spacing:0.15em; color:${brandColor}; font-weight:600;">Feature Story</p>
          <h2 style="font-size:1.6rem; font-weight:800; color:#111; line-height:1.2; margin:0.3rem 0;">${main.title}</h2>
          <div style="width:30px; height:3px; background:${brandColor}; margin:0.5rem 0;"></div>
          <p style="font-size:0.85rem; color:#666; line-height:1.6;">${main.content.match(/<p>(.*?)<\/p>/)?.[1]?.slice(0, 200) ?? ''}...</p>
        </div>
      </div>
    `, main.imageUrl, main.keywords);

    // Page 4: Article body (first half)
    const contentParts = splitContentInHalf(main.content);
    addPage('article', main.title, `
      <div style="padding:0.8rem;">
        <p style="text-transform:uppercase; font-size:0.65rem; letter-spacing:0.15em; color:${brandColor}; font-weight:600; margin-bottom:0.8rem;">Feature Story — Continued</p>
        <div style="font-size:0.95rem; line-height:1.8; color:#333;">${contentParts[0]}</div>
      </div>
    `, undefined, main.keywords);

    // Page 5: Article body (second half) + pull quote + CTA
    addPage('article', main.title, `
      <div style="padding:0.8rem;">
        ${main.pullQuote ? `
          <blockquote style="margin:0 0 1.2rem 0; padding:1rem 1.2rem; border-left:3px solid ${brandColor}; background:${brandColor}08; border-radius:0 8px 8px 0; font-size:1.05rem; font-style:italic; color:#333; line-height:1.6;">“${main.pullQuote}”</blockquote>
        ` : ''}
        <div style="font-size:0.95rem; line-height:1.8; color:#333;">${contentParts[1]}</div>
        <div style="margin-top:1.5rem; padding:1rem 1.2rem; background:${brandColor}; border-radius:8px; text-align:center;">
          <p style="color:rgba(255,255,255,0.8); font-size:0.75rem; margin:0 0 0.4rem 0;">Ready to get started?</p>
          <a href="${businessUrl}" style="color:white; text-decoration:none; font-weight:700; font-size:1rem;">Visit ${businessName} →</a>
        </div>
      </div>
    `, undefined, main.keywords);
  }

  // ===== SUPPORTING ARTICLES: 2-PAGE SPREADS =====
  const supporting = articles.slice(1);
  supporting.forEach((article, idx) => {
    // Page A: Image opener + article start
    addPage('article', article.title, `
      <div style="height:100%; display:flex; flex-direction:column;">
        ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}" style="width:100%; height:45%; object-fit:cover; border-radius:8px;" />` : `<div style="width:100%;height:30%;background:linear-gradient(135deg, ${brandColor}15, ${brandColor}05);border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="font-size:2.5rem;font-weight:800;color:${brandColor}30;">${String(idx + 2).padStart(2, '0')}</span></div>`}
        <div style="flex:1; padding-top:1rem;">
          <p style="text-transform:uppercase; font-size:0.65rem; letter-spacing:0.15em; color:${brandColor}; font-weight:600;">${article.topic}</p>
          <h2 style="font-size:1.4rem; font-weight:800; color:#111; line-height:1.25; margin:0.4rem 0 0.6rem 0;">${article.title}</h2>
          <div style="font-size:0.92rem; line-height:1.8; color:#333;">${getFirstNParagraphs(article.content, 3)}</div>
        </div>
      </div>
    `, article.imageUrl, article.keywords);

    // Page B: Article continuation + pull quote + CTA
    const remaining = removeFirstNParagraphs(article.content, 3);
    addPage('article', article.title, `
      <div style="padding:0.8rem;">
        <p style="text-transform:uppercase; font-size:0.6rem; letter-spacing:0.15em; color:${brandColor}; font-weight:600; margin-bottom:0.8rem;">${article.topic} — Continued</p>
        <div style="font-size:0.9rem; line-height:1.8; color:#333;">${remaining}</div>
        ${article.pullQuote ? `
          <blockquote style="margin:1.2rem 0; padding:1rem 1.2rem; border-left:3px solid ${brandColor}; background:${brandColor}08; border-radius:0 8px 8px 0; font-size:0.95rem; font-style:italic; color:#444; line-height:1.6;">“${article.pullQuote}”</blockquote>
        ` : ''}
        <div style="margin-top:1.5rem; padding:0.8rem 1rem; background:${brandColor}0a; border-radius:8px; display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:0.8rem; color:#555;">Learn more about <strong>${businessName}</strong></span>
          <a href="${businessUrl}" style="display:inline-block; padding:0.5rem 1rem; background:${brandColor}; color:white; border-radius:6px; text-decoration:none; font-size:0.8rem; font-weight:600;">Visit Website →</a>
        </div>
      </div>
    `, undefined, article.keywords);
  });

  // ===== SUBSCRIBER ADS (only when provided) =====
  subscriberAds.forEach((ad) => {
    addPage('ad', ad.advertiserName ?? 'Advertisement', `
      <div style="display:flex; align-items:center; justify-content:center; height:100%; padding:1rem;">
        ${ad.linkUrl ? `<a href="${ad.linkUrl}" target="_blank" rel="noopener noreferrer" style="display:block; width:100%; height:100%;">` : ''}
          <img src="${ad.imageUrl}" alt="${ad.advertiserName ?? 'Advertisement'}" style="width:100%; height:100%; object-fit:contain; border-radius:8px;" />
        ${ad.linkUrl ? '</a>' : ''}
      </div>
    `, ad.imageUrl);
  });

  // ===== BACK COVER =====
  addPage('back-cover', 'Back Cover', `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; padding:2rem; background:linear-gradient(180deg, white 0%, ${brandColor}08 100%);">
      <div style="width:60px; height:60px; background:${brandColor}; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem;">
        <span style="color:white; font-size:1.5rem; font-weight:800;">${businessName.charAt(0)}</span>
      </div>
      <h2 style="font-size:1.4rem; font-weight:800; color:${brandColor}; margin-bottom:0.5rem;">${businessName}</h2>
      ${tagline ? `<p style="font-size:0.9rem; color:#666; margin-bottom:1rem;">${tagline}</p>` : ''}
      <a href="${businessUrl}" style="display:inline-block; padding:0.6rem 1.5rem; background:${brandColor}; color:white; border-radius:8px; text-decoration:none; font-size:0.85rem; font-weight:600;">${businessUrl.replace(/https?:\/\//, '').replace(/\/$/, '')}</a>
      <div style="margin-top:2rem; padding-top:1.5rem; border-top:1px solid #eee;">
        <p style="font-size:0.7rem; color:#bbb;">Powered by Magazinify AI™ — A NOFA AI Factory™ Product</p>
      </div>
    </div>
  `);

  return pages;
}

// ── Content splitting helpers ─────────────────────────────

function splitContentInHalf(html: string): [string, string] {
  const tags = html.match(/<(p|h[2-4]|ul|ol|blockquote|li)[^>]*>[\s\S]*?<\/\1>/g) ?? [html];
  const mid = Math.ceil(tags.length / 2);
  return [tags.slice(0, mid).join(''), tags.slice(mid).join('')];
}

function getFirstNParagraphs(html: string, n: number): string {
  const tags = html.match(/<(p|h[2-4]|ul|ol|blockquote)[^>]*>[\s\S]*?<\/\1>/g) ?? [];
  return tags.slice(0, n).join('');
}

function removeFirstNParagraphs(html: string, n: number): string {
  const tags = html.match(/<(p|h[2-4]|ul|ol|blockquote)[^>]*>[\s\S]*?<\/\1>/g) ?? [];
  return tags.slice(n).join('') || '<p>Continued from previous page.</p>';
}

