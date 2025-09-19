import { dbService } from '../database/firebase.js';
import { auth } from '../database/firebase.js';

// Standard API response format
export const createResponse = (data = null, error = null) => {
  if (error) {
    return {
      ok: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred'
      }
    };
  }
  
  return {
    ok: true,
    ...data
  };
};

// Error classes for standardized error handling
export class APIError extends Error {
  constructor(code, message, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ForbiddenError extends APIError {
  constructor(message = 'Access forbidden') {
    super('403_FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends APIError {
  constructor(message = 'Resource not found') {
    super('404_NOT_FOUND', message, 404);
  }
}

export class PlanLimitError extends APIError {
  constructor(message = 'Plan limit exceeded') {
    super('422_PLAN_LIMIT', message, 422);
  }
}

export class InvalidStateError extends APIError {
  constructor(message = 'Invalid state for operation') {
    super('422_INVALID_STATE', message, 422);
  }
}

export class BillingRequiredError extends APIError {
  constructor(message = 'Active billing required') {
    super('402_BILLING_REQUIRED', message, 402);
  }
}

// Server-side Firebase Auth verification
export const verifyAuthToken = async (request) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ForbiddenError('No valid authorization token provided');
    }

    const token = authHeader.substring(7);
    const decodedToken = await auth.verifyIdToken(token);
    
    return decodedToken;
  } catch (error) {
    throw new ForbiddenError('Invalid or expired token');
  }
};

// Get tenant by slug with error handling
export const getTenantBySlug = async (tenantSlug) => {
  try {
    const tenant = await dbService.tenants.getBySlug(tenantSlug);
    return tenant;
  } catch (error) {
    throw new NotFoundError(`Tenant '${tenantSlug}' not found`);
  }
};

// Get magazine by slug with error handling
export const getMagazineBySlug = async (tenantId, magazineSlug) => {
  try {
    const magazine = await dbService.magazines.getById(tenantId, magazineSlug);
    return magazine;
  } catch (error) {
    throw new NotFoundError(`Magazine '${magazineSlug}' not found`);
  }
};

// Get blueprint with fallback to default
export const getBlueprint = async (tenantId, magazineId) => {
  try {
    const blueprint = await dbService.blueprints.get(tenantId, magazineId);
    return blueprint;
  } catch (error) {
    // Return default blueprint if none exists
    return dbService.blueprints.getDefault();
  }
};

// Check if user has required tenant role
export const requireTenantRole = async (userId, tenantId, requiredRoles = ['owner', 'editor']) => {
  try {
    const user = await dbService.users.getById(userId);
    
    if (!user.tenants || !Array.isArray(user.tenants)) {
      throw new ForbiddenError('User has no tenant access');
    }

    const tenantAccess = user.tenants.find(t => 
      t.tenantRef && t.tenantRef.id === tenantId
    );

    if (!tenantAccess) {
      throw new ForbiddenError('User does not have access to this tenant');
    }

    if (!requiredRoles.includes(tenantAccess.role)) {
      throw new ForbiddenError(`Required role: ${requiredRoles.join(' or ')}`);
    }

    return tenantAccess;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new ForbiddenError('Unable to verify tenant access');
  }
};

// Assert plan limits
export const assertPlanLimit = (requestedValue, maxValue, limitName) => {
  if (maxValue !== -1 && requestedValue > maxValue) {
    throw new PlanLimitError(`${limitName} limit exceeded. Requested: ${requestedValue}, Max: ${maxValue}`);
  }
};

// Enforce active billing status
export const enforceActiveBilling = (tenant) => {
  if (tenant.billingStatus !== 'active') {
    throw new BillingRequiredError('Active billing status required for this operation');
  }
};

// Load full context for issue operations
export const loadContext = async (tenantSlug, magazineSlug) => {
  const tenant = await getTenantBySlug(tenantSlug);
  const magazine = await getMagazineBySlug(tenant.id, magazineSlug);
  const blueprint = await getBlueprint(tenant.id, magazine.id);
  
  return { tenant, magazine, blueprint };
};

// Get issue path helpers
export const getIssuePath = (tenantId, magazineId, issueSlug) => {
  return {
    tenantId,
    magazineId,
    issueSlug,
    articlesPath: `tenants/${tenantId}/magazines/${magazineId}/issues/${issueSlug}/articles`,
    adSlotsPath: `tenants/${tenantId}/magazines/${magazineId}/issues/${issueSlug}/adSlots`
  };
};

// Revalidate Next.js paths (placeholder for Vercel integration)
export const revalidatePaths = async (paths) => {
  // In a real implementation, this would call Vercel's revalidation API
  // or use Next.js revalidatePath/revalidateTag
  console.log('Revalidating paths:', paths);
  
  // For now, we'll just log the paths that should be revalidated
  // In production, you'd implement actual ISR revalidation here
  return { revalidated: paths.length };
};

// Render sprites for flipbook (placeholder)
export const renderSprites = async (issue, articles) => {
  // This would integrate with a rendering service to create page sprites
  // For now, return placeholder data
  const sprites = [];
  
  for (let page = 1; page <= (issue.pageCount || 12); page++) {
    sprites.push({
      page,
      url: `/placeholder-cover.svg`,
      width: 800,
      height: 1200
    });
  }
  
  return sprites;
};

// Render reading mode HTML (placeholder)
export const renderReadingHTML = (article) => {
  // This would sanitize and format the article HTML for reading mode
  // For now, return the HTML as-is with basic sanitization
  
  // In production, you'd use a library like DOMPurify or similar
  const sanitizedHTML = article.html || '';
  
  return {
    html: sanitizedHTML,
    meta: {
      title: article.title,
      readingTime: article.meta?.readingTime || 5,
      wordCount: article.meta?.wordCount || 500
    }
  };
};

// Validate request body against schema
export const validateRequestBody = (body, requiredFields = []) => {
  if (!body || typeof body !== 'object') {
    throw new APIError('400_BAD_REQUEST', 'Request body must be a valid JSON object', 400);
  }

  for (const field of requiredFields) {
    if (!(field in body) || body[field] === null || body[field] === undefined) {
      throw new APIError('400_BAD_REQUEST', `Missing required field: ${field}`, 400);
    }
  }

  return body;
};

// Rate limiting helper (placeholder)
export const checkRateLimit = async (key, limit = 100, window = 3600) => {
  // In production, implement rate limiting using Redis or similar
  // For now, just return success
  return { allowed: true, remaining: limit - 1 };
};

// Generate tracking code for ads
export const generateTrackingCode = (baseUrl, source = 'magazinify', medium = 'ad', campaign = null) => {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
  });
  
  if (campaign) {
    params.set('utm_campaign', campaign);
  }
  
  return `${baseUrl}?${params.toString()}`;
};

// Materialize article document from AI output
export const materializeArticleDoc = (draft, images, position) => {
  return {
    position,
    slug: draft.slug || draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: draft.title,
    html: draft.content || draft.html,
    heroUrl: images?.[0]?.url || null,
    tags: draft.tags || [],
    meta: {
      readingTime: draft.readingTime || Math.ceil((draft.content?.length || 0) / 1000),
      wordCount: draft.wordCount || (draft.content?.split(' ').length || 0)
    }
  };
};

// Write issue with articles in a batch
export const writeIssueWithArticles = async ({ tenant, magazine, issueSlug, articles, adSlots, status = 'draft' }) => {
  // Create the issue
  const issueData = {
    title: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
    slug: issueSlug,
    status,
    coverUrl: null,
    pdfUrl: null,
    publishedAt: status === 'published' ? new Date() : null,
    meta: {}
  };
  
  const issue = await dbService.issues.create(tenant.id, magazine.id, issueData);
  
  // Create articles
  const createdArticles = [];
  for (const article of articles) {
    const created = await dbService.articles.create(tenant.id, magazine.id, issueSlug, article);
    createdArticles.push(created);
  }
  
  // Create ad slot placeholders
  const createdAdSlots = [];
  for (const adSlot of adSlots) {
    const created = await dbService.adSlots.create(tenant.id, magazine.id, issueSlug, adSlot.slotKey, {
      creativeUrl: null,
      targetUrl: null,
      sponsor: null,
      trackingCode: null
    });
    createdAdSlots.push(created);
  }
  
  return {
    issue,
    articles: createdArticles,
    adSlots: createdAdSlots
  };
};

export default {
  createResponse,
  APIError,
  ForbiddenError,
  NotFoundError,
  PlanLimitError,
  InvalidStateError,
  BillingRequiredError,
  verifyAuthToken,
  getTenantBySlug,
  getMagazineBySlug,
  getBlueprint,
  requireTenantRole,
  assertPlanLimit,
  enforceActiveBilling,
  loadContext,
  getIssuePath,
  revalidatePaths,
  renderSprites,
  renderReadingHTML,
  validateRequestBody,
  checkRateLimit,
  generateTrackingCode,
  materializeArticleDoc,
  writeIssueWithArticles,
};
