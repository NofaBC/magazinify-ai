// API Routes for Public Content Access
// This would be implemented as Next.js API routes in a real application

import { 
  createResponse, 
  getTenantBySlug, 
  getMagazineBySlug,
  validateRequestBody,
  renderReadingHTML,
  NotFoundError
} from '../lib/api/utils.js';
import { dbService } from '../lib/database/firebase.js';

/**
 * GET /api/public/issue
 * Get published issue data for public viewing (flipbook)
 */
export async function getPublicIssue(request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const tenantSlug = url.searchParams.get('tenantSlug');
    const magazineSlug = url.searchParams.get('magazineSlug');
    const issueSlug = url.searchParams.get('issueSlug');
    
    if (!tenantSlug || !magazineSlug || !issueSlug) {
      return Response.json(
        createResponse(null, { code: '400_BAD_REQUEST', message: 'tenantSlug, magazineSlug, and issueSlug are required' }),
        { status: 400 }
      );
    }
    
    // Get tenant and magazine
    const tenant = await getTenantBySlug(tenantSlug);
    const magazine = await getMagazineBySlug(tenant.id, magazineSlug);
    
    // Get published issue only
    const issue = await dbService.issues.getPublished(tenant.id, magazine.id, issueSlug);
    
    // Get articles for the issue
    const articles = await dbService.articles.getByIssue(tenant.id, magazine.id, issueSlug);
    
    // Get ad slots
    const adSlots = await dbService.adSlots.getByIssue(tenant.id, magazine.id, issueSlug);
    
    // Prepare sprites data (page images for flipbook)
    const sprites = issue.sprites || [];
    
    // Prepare response data
    const responseData = {
      issue: {
        slug: issue.slug,
        title: issue.title,
        coverUrl: issue.coverUrl,
        publishedAt: issue.publishedAt,
        meta: issue.meta
      },
      sprites: sprites.map(sprite => ({
        page: sprite.page,
        url: sprite.url,
        width: sprite.width || 800,
        height: sprite.height || 1200
      })),
      articles: articles.map(article => ({
        slug: article.slug,
        title: article.title,
        heroUrl: article.heroUrl,
        tags: article.tags,
        position: article.position,
        readingTime: article.meta?.readingTime || 5
      })),
      adSlots: adSlots.map(ad => ({
        slotKey: ad.id,
        creativeUrl: ad.creativeUrl,
        targetUrl: ad.targetUrl,
        sponsor: ad.sponsor
      }))
    };
    
    return Response.json(createResponse(responseData));
    
  } catch (error) {
    console.error('Error getting public issue:', error);
    return Response.json(
      createResponse(null, error),
      { status: error.statusCode || 500 }
    );
  }
}

/**
 * GET /api/public/article
 * Get article content for reading mode
 */
export async function getPublicArticle(request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const tenantSlug = url.searchParams.get('tenantSlug');
    const magazineSlug = url.searchParams.get('magazineSlug');
    const issueSlug = url.searchParams.get('issueSlug');
    const articleSlug = url.searchParams.get('articleSlug');
    
    if (!tenantSlug || !magazineSlug || !issueSlug || !articleSlug) {
      return Response.json(
        createResponse(null, { code: '400_BAD_REQUEST', message: 'All parameters are required' }),
        { status: 400 }
      );
    }
    
    // Get tenant and magazine
    const tenant = await getTenantBySlug(tenantSlug);
    const magazine = await getMagazineBySlug(tenant.id, magazineSlug);
    
    // Verify issue is published
    const issue = await dbService.issues.getPublished(tenant.id, magazine.id, issueSlug);
    
    // Get all articles to find the one with matching slug
    const articles = await dbService.articles.getByIssue(tenant.id, magazine.id, issueSlug);
    const article = articles.find(a => a.slug === articleSlug);
    
    if (!article) {
      throw new NotFoundError(`Article '${articleSlug}' not found`);
    }
    
    // Render reading HTML
    const renderedContent = renderReadingHTML(article);
    
    // Prepare response data
    const responseData = {
      html: renderedContent.html,
      meta: {
        title: article.title,
        readingTime: renderedContent.meta.readingTime,
        wordCount: renderedContent.meta.wordCount,
        tags: article.tags,
        heroUrl: article.heroUrl,
        publishedAt: issue.publishedAt
      }
    };
    
    return Response.json(createResponse(responseData));
    
  } catch (error) {
    console.error('Error getting public article:', error);
    return Response.json(
      createResponse(null, error),
      { status: error.statusCode || 500 }
    );
  }
}

/**
 * GET /api/public/latest
 * Redirect to latest published issue
 */
export async function getLatestIssue(request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const tenantSlug = url.searchParams.get('tenantSlug');
    const magazineSlug = url.searchParams.get('magazineSlug');
    
    if (!tenantSlug || !magazineSlug) {
      return Response.json(
        createResponse(null, { code: '400_BAD_REQUEST', message: 'tenantSlug and magazineSlug are required' }),
        { status: 400 }
      );
    }
    
    // Get tenant and magazine
    const tenant = await getTenantBySlug(tenantSlug);
    const magazine = await getMagazineBySlug(tenant.id, magazineSlug);
    
    // Get latest published issue
    const issues = await dbService.issues.getByMagazine(tenant.id, magazine.id);
    const publishedIssues = issues.filter(issue => issue.status === 'published');
    
    if (publishedIssues.length === 0) {
      throw new NotFoundError('No published issues found');
    }
    
    // Sort by published date and get the latest
    const latestIssue = publishedIssues.sort((a, b) => 
      new Date(b.publishedAt?.seconds * 1000 || b.publishedAt) - 
      new Date(a.publishedAt?.seconds * 1000 || a.publishedAt)
    )[0];
    
    // Construct redirect URL
    const baseUrl = tenant.featureFlags?.hasCustomDomain && tenant.featureFlags?.customDomain
      ? `https://${tenant.featureFlags.customDomain}`
      : `https://${tenantSlug}.magazinify.ai`;
    
    const redirectUrl = `${baseUrl}/issues/${latestIssue.slug}`;
    
    return Response.redirect(redirectUrl, 302);
    
  } catch (error) {
    console.error('Error getting latest issue:', error);
    return Response.json(
      createResponse(null, error),
      { status: error.statusCode || 500 }
    );
  }
}

/**
 * GET /api/public/archive
 * Get list of published issues for archive page
 */
export async function getIssueArchive(request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const tenantSlug = url.searchParams.get('tenantSlug');
    const magazineSlug = url.searchParams.get('magazineSlug');
    const limit = parseInt(url.searchParams.get('limit') || '24');
    
    if (!tenantSlug || !magazineSlug) {
      return Response.json(
        createResponse(null, { code: '400_BAD_REQUEST', message: 'tenantSlug and magazineSlug are required' }),
        { status: 400 }
      );
    }
    
    // Get tenant and magazine
    const tenant = await getTenantBySlug(tenantSlug);
    const magazine = await getMagazineBySlug(tenant.id, magazineSlug);
    
    // Get published issues
    const allIssues = await dbService.issues.getByMagazine(tenant.id, magazine.id);
    const publishedIssues = allIssues
      .filter(issue => issue.status === 'published')
      .sort((a, b) => 
        new Date(b.publishedAt?.seconds * 1000 || b.publishedAt) - 
        new Date(a.publishedAt?.seconds * 1000 || a.publishedAt)
      )
      .slice(0, limit);
    
    // Prepare response data
    const responseData = {
      magazine: {
        title: magazine.title,
        description: magazine.description
      },
      issues: publishedIssues.map(issue => ({
        slug: issue.slug,
        title: issue.title,
        coverUrl: issue.coverUrl,
        publishedAt: issue.publishedAt,
        meta: issue.meta
      })),
      total: publishedIssues.length
    };
    
    return Response.json(createResponse(responseData));
    
  } catch (error) {
    console.error('Error getting issue archive:', error);
    return Response.json(
      createResponse(null, error),
      { status: error.statusCode || 500 }
    );
  }
}

// Export route handlers for Next.js API routes
export const publicHandlers = {
  issue: getPublicIssue,
  article: getPublicArticle,
  latest: getLatestIssue,
  archive: getIssueArchive
};
