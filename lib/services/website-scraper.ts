import * as cheerio from 'cheerio';
import type { ScrapedBusinessData } from '@/types/magazine';
import { logger } from '@/lib/utils/logger';

/** Scrape a business website and extract relevant content */
export async function scrapeBusinessUrl(
  url: string
): Promise<ScrapedBusinessData> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; MagazinifyBot/1.0; +https://magazinify.ai)',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove script/style/nav/footer noise
    $('script, style, nav, footer, header, iframe, noscript').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim();
    const description =
      $('meta[name="description"]').attr('content')?.trim() ?? '';

    const headings: string[] = [];
    $('h1, h2, h3').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 200) headings.push(text);
    });

    const paragraphs: string[] = [];
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 30) paragraphs.push(text);
    });

    const images: string[] = [];
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !src.includes('data:') && !src.includes('pixel')) {
        // Make absolute URL if relative
        try {
          const absoluteUrl = new URL(src, url).href;
          images.push(absoluteUrl);
        } catch {
          // skip invalid URLs
        }
      }
    });

    const links: string[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.startsWith('http')) links.push(href);
    });

    // Extract keywords from meta tags and content
    const metaKeywords =
      $('meta[name="keywords"]').attr('content')?.split(',').map((k) => k.trim()) ?? [];

    const rawText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);

    return {
      title,
      description,
      headings: headings.slice(0, 20),
      paragraphs: paragraphs.slice(0, 30),
      images: images.slice(0, 10),
      links: links.slice(0, 20),
      keywords: metaKeywords.slice(0, 20),
      rawText,
    };
  } catch (err) {
    logger.error('Website scraping failed', {
      url,
      error: err instanceof Error ? err.message : String(err),
    });
    // Return minimal data so generation can still proceed
    return {
      title: '',
      description: '',
      headings: [],
      paragraphs: [],
      images: [],
      links: [],
      keywords: [],
      rawText: '',
    };
  }
}