// API Routes for Issue Management
// This would be implemented as Next.js API routes in a real application

import { 
  createResponse, 
  verifyAuthToken, 
  getTenantBySlug, 
  getMagazineBySlug, 
  getBlueprint,
  requireTenantRole,
  validateRequestBody,
  enforceActiveBilling,
  writeIssueWithArticles,
  revalidatePaths,
  renderSprites,
  InvalidStateError,
  materializeArticleDoc
} from '../lib/api/utils.js';
import { dbService } from '../lib/database/firebase.js';
import { contentPipeline } from '../lib/ai/contentPipeline.js';

/**
 * POST /api/issues/generate
 * Generate a new magazine issue draft using AI
 */
export async function generateIssue(request) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);
    
    // Parse request body
    const body = await request.json();
    const { tenantSlug, magazineSlug, issueSlug } = validateRequestBody(body, [
      'tenantSlug',
      'magazineSlug', 
      'issueSlug'
    ]);
    
    // Get tenant and magazine
    const tenant = await getTenantBySlug(tenantSlug);
    const magazine = await getMagazineBySlug(tenant.id, magazineSlug);
    
    // Check permissions
    await requireTenantRole(user.uid, tenant.id, ['owner', 'editor']);
    
    // Enforce active billing
    enforceActiveBilling(tenant);
    
    // Get blueprint
    const blueprint = await getBlueprint(tenant.id, magazine.id);
    
    // Check if issue already exists
    try {
      const existingIssue = await dbService.issues.getById(tenant.id, magazine.id, issueSlug);
      if (existingIssue) {
        throw new InvalidStateError(`Issue ${issueSlug} already exists`);
      }
    } catch (error) {
      // Issue doesn't exist, which is what we want
      if (!error.message.includes('not found')) {
        throw error;
      }
    }
    
    // Generate content using AI pipeline
    const { issue, articles, outline } = await contentPipeline.generateIssueDraft({
      tenantSlug,
      magazineSlug,
      issueSlug,
      blueprint,
      tenant,
      magazine
    });
    
    // Create issue and articles in database
    const result = await writeIssueWithArticles({
      tenant,
      magazine,
      issueSlug,
      articles: articles.map((article, index) => materializeArticleDoc(article, { heroUrl: article.heroUrl }, index + 1)),
      adSlots: blueprint.structure.adSlots.map(slotKey => ({ slotKey })),
      status: 'ready'
    });
    
    return Response.json(createResponse({
      issueId: result.issue.id,
      status: 'ready',
      articlesCount: articles.length,
      outline
    }));
    
  } catch (error) {
    console.error('Error generating issue:', error);
    return Response.json(
      createResponse(null, error),
      { status: error.statusCode || 500 }
    );
  }
}

/**
 * POST /api/issues/regenerate-article
 * Regenerate a specific article with optional prompt override
 */
export async function regenerateArticle(request) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);
    
    // Parse request body
    const body = await request.json();
    const { tenantSlug, magazineSlug, issueSlug, articleId, promptOverride } = validateRequestBody(body, [
      'tenantSlug',
      'magazineSlug',
      'issueSlug',
      'articleId'
    ]);
    
    // Get tenant and magazine
    const tenant = await getTenantBySlug(tenantSlug);
    const magazine = await getMagazineBySlug(tenant.id, magazineSlug);
    
    // Check permissions
    await requireTenantRole(user.uid, tenant.id, ['owner', 'editor']);
    
    // Get blueprint and existing article
    const blueprint = await getBlueprint(tenant.id, magazine.id);
    const article = await dbService.articles.getById(tenant.id, magazine.id, issueSlug, articleId);
    
    // Regenerate article using AI
    const updatedArticle = await contentPipeline.regenerateArticle({
      article,
      promptOverride,
      voice: blueprint.voice,
      niche: blueprint.niche
    });
    
    // Update article in database
    await dbService.articles.update(tenant.id, magazine.id, issueSlug, articleId, updatedArticle);
    
    return Response.json(createResponse({
      articleId,
      updated: true
    }));
    
  } catch (error) {
    console.error('Error regenerating article:', error);
    return Response.json(
      createResponse(null, error),
      { status: error.statusCode || 500 }
    );
  }
}

/**
 * POST /api/issues/update
 * Update issue metadata (title, cover, etc.)
 */
export async function updateIssue(request) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);
    
    // Parse request body
    const body = await request.json();
    const { tenantSlug, magazineSlug, issueSlug, patch } = validateRequestBody(body, [
      'tenantSlug',
      'magazineSlug',
      'issueSlug',
      'patch'
    ]);
    
    // Get tenant and magazine
    const tenant = await getTenantBySlug(tenantSlug);
    const magazine = await getMagazineBySlug(tenant.id, magazineSlug);
    
    // Check permissions
    await requireTenantRole(user.uid, tenant.id, ['owner', 'editor']);
    
    // Update issue
    await dbService.issues.update(tenant.id, magazine.id, issueSlug, patch);
    
    return Response.json(createResponse({ updated: true }));
    
  } catch (error) {
    console.error('Error updating issue:', error);
    return Response.json(
      createResponse(null, error),
      { status: error.statusCode || 500 }
    );
  }
}

/**
 * POST /api/issues/ads
 * Upload/set ad slots for an issue
 */
export async function updateAds(request) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);
    
    // Parse request body
    const body = await request.json();
    const { tenantSlug, magazineSlug, issueSlug, ads } = validateRequestBody(body, [
      'tenantSlug',
      'magazineSlug',
      'issueSlug',
      'ads'
    ]);
    
    // Get tenant and magazine
    const tenant = await getTenantBySlug(tenantSlug);
    const magazine = await getMagazineBySlug(tenant.id, magazineSlug);
    
    // Check permissions
    await requireTenantRole(user.uid, tenant.id, ['owner', 'editor']);
    
    // Update ad slots
    let updatedCount = 0;
    for (const ad of ads) {
      await dbService.adSlots.update(tenant.id, magazine.id, issueSlug, ad.slotKey, {
        creativeUrl: ad.creativeUrl,
        targetUrl: ad.targetUrl,
        sponsor: ad.sponsor,
        trackingCode: ad.trackingCode
      });
      updatedCount++;
    }
    
    return Response.json(createResponse({
      updated: updatedCount
    }));
    
  } catch (error) {
    console.error('Error updating ads:', error);
    return Response.json(
      createResponse(null, error),
      { status: error.statusCode || 500 }
    );
  }
}

/**
 * POST /api/issues/publish
 * Publish an issue (schedule or immediate)
 */
export async function publishIssue(request) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);
    
    // Parse request body
    const body = await request.json();
    const { tenantSlug, magazineSlug, issueSlug, publishAt } = validateRequestBody(body, [
      'tenantSlug',
      'magazineSlug',
      'issueSlug'
    ]);
    
    // Get tenant and magazine
    const tenant = await getTenantBySlug(tenantSlug);
    const magazine = await getMagazineBySlug(tenant.id, magazineSlug);
    
    // Check permissions
    await requireTenantRole(user.uid, tenant.id, ['owner', 'editor']);
    
    // Enforce active billing
    enforceActiveBilling(tenant);
    
    // Get issue and validate state
    const issue = await dbService.issues.getById(tenant.id, magazine.id, issueSlug);
    
    if (!['ready', 'scheduled'].includes(issue.status)) {
      throw new InvalidStateError('Issue must be in ready or scheduled state to publish');
    }
    
    // Get articles for rendering
    const articles = await dbService.articles.getByIssue(tenant.id, magazine.id, issueSlug);
    
    // Render sprites (placeholder implementation)
    const sprites = await renderSprites(issue, articles);
    
    // Determine publish time
    const publishTime = publishAt ? new Date(publishAt) : new Date();
    const isScheduled = publishTime > new Date();
    
    // Update issue status
    const updateData = {
      status: isScheduled ? 'scheduled' : 'published',
      publishedAt: isScheduled ? null : publishTime,
      scheduledAt: isScheduled ? publishTime : null,
      sprites: sprites
    };
    
    await dbService.issues.update(tenant.id, magazine.id, issueSlug, updateData);
    
    // Revalidate public routes if published immediately
    if (!isScheduled) {
      const pathsToRevalidate = [
        `/${tenantSlug}/issues/${issueSlug}`,
        `/${tenantSlug}/issues`,
        `/latest/${tenantSlug}`
      ];
      
      await revalidatePaths(pathsToRevalidate);
    }
    
    // Construct public URL
    const baseUrl = tenant.featureFlags?.hasCustomDomain && tenant.featureFlags?.customDomain
      ? `https://${tenant.featureFlags.customDomain}`
      : `https://${tenantSlug}.magazinify.ai`;
    
    const publicUrl = `${baseUrl}/issues/${issueSlug}`;
    
    return Response.json(createResponse({
      url: publicUrl,
      status: updateData.status,
      publishedAt: updateData.publishedAt,
      scheduledAt: updateData.scheduledAt
    }));
    
  } catch (error) {
    console.error('Error publishing issue:', error);
    return Response.json(
      createResponse(null, error),
      { status: error.statusCode || 500 }
    );
  }
}

/**
 * POST /api/issues/cancel
 * Cancel/unpublish an issue (admin only)
 */
export async function cancelIssue(request) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);
    
    // Check admin permissions (simplified - in production, check custom claims)
    if (!user.admin) {
      throw new ForbiddenError('Admin access required');
    }
    
    // Parse request body
    const body = await request.json();
    const { tenantSlug, magazineSlug, issueSlug } = validateRequestBody(body, [
      'tenantSlug',
      'magazineSlug',
      'issueSlug'
    ]);
    
    // Get tenant and magazine
    const tenant = await getTenantBySlug(tenantSlug);
    const magazine = await getMagazineBySlug(tenant.id, magazineSlug);
    
    // Update issue status
    await dbService.issues.update(tenant.id, magazine.id, issueSlug, {
      status: 'canceled',
      canceledAt: new Date()
    });
    
    return Response.json(createResponse({ canceled: true }));
    
  } catch (error) {
    console.error('Error canceling issue:', error);
    return Response.json(
      createResponse(null, error),
      { status: error.statusCode || 500 }
    );
  }
}

// Export route handlers for Next.js API routes
export const issueHandlers = {
  generate: generateIssue,
  regenerateArticle: regenerateArticle,
  update: updateIssue,
  ads: updateAds,
  publish: publishIssue,
  cancel: cancelIssue
};
