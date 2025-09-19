// API Routes for Blueprint Management
// This would be implemented as Next.js API routes in a real application

import { 
  createResponse, 
  verifyAuthToken, 
  getTenantBySlug, 
  getMagazineBySlug, 
  getBlueprint,
  requireTenantRole,
  validateRequestBody,
  assertPlanLimit
} from '../lib/api/utils.js';
import { dbService } from '../lib/database/firebase.js';

/**
 * GET /api/blueprints
 * Get blueprint for a specific tenant and magazine
 */
export async function getBlueprints(request) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);
    
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
    
    // Check permissions
    await requireTenantRole(user.uid, tenant.id, ['owner', 'editor']);
    
    // Get blueprint
    const blueprint = await getBlueprint(tenant.id, magazine.id);
    
    return Response.json(createResponse({ blueprint }));
    
  } catch (error) {
    console.error('Error getting blueprint:', error);
    return Response.json(
      createResponse(null, error),
      { status: error.statusCode || 500 }
    );
  }
}

/**
 * POST /api/blueprints/save
 * Save blueprint configuration
 */
export async function saveBlueprint(request) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);
    
    // Parse request body
    const body = await request.json();
    const {
      tenantSlug,
      magazineSlug,
      structure,
      voice,
      niche,
      sources,
      cadence,
      approvalMode
    } = validateRequestBody(body, [
      'tenantSlug',
      'magazineSlug',
      'structure',
      'voice',
      'niche',
      'sources',
      'cadence',
      'approvalMode'
    ]);
    
    // Get tenant and magazine
    const tenant = await getTenantBySlug(tenantSlug);
    const magazine = await getMagazineBySlug(tenant.id, magazineSlug);
    
    // Check permissions
    await requireTenantRole(user.uid, tenant.id, ['owner', 'editor']);
    
    // Validate plan limits
    const maxPages = tenant.featureFlags?.maxPages || 12;
    assertPlanLimit(structure.pages, maxPages, 'Pages');
    
    // Validate structure
    if (structure.pages < 8) {
      throw new APIError('422_INVALID_INPUT', 'Minimum page count is 8', 422);
    }
    
    if (!structure.sections.includes('cover')) {
      throw new APIError('422_INVALID_INPUT', 'Blueprint must include a cover section', 422);
    }
    
    if (!structure.sections.includes('closing')) {
      throw new APIError('422_INVALID_INPUT', 'Blueprint must include a closing section', 422);
    }
    
    // Prepare blueprint data
    const blueprintData = {
      structure: {
        pages: structure.pages,
        sections: structure.sections,
        adSlots: structure.adSlots || []
      },
      voice: {
        tone: voice.tone,
        readingLevel: voice.readingLevel
      },
      niche: {
        topics: niche.topics || [],
        geo: niche.geo || [],
        keywords: niche.keywords || []
      },
      sources: {
        rss: sources.rss || [],
        uploadsAllowed: sources.uploadsAllowed !== false
      },
      cadence,
      approvalMode
    };
    
    // Save blueprint
    await dbService.blueprints.update(tenant.id, magazine.id, blueprintData);
    
    return Response.json(createResponse({ success: true }));
    
  } catch (error) {
    console.error('Error saving blueprint:', error);
    return Response.json(
      createResponse(null, error),
      { status: error.statusCode || 500 }
    );
  }
}

// Export route handlers for Next.js API routes
export const blueprintHandlers = {
  GET: getBlueprints,
  POST: saveBlueprint
};
