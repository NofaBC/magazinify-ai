// API Routes for Analytics Management
// This would be implemented as Next.js API routes in a real application

import { 
  createResponse, 
  verifyAuthToken, 
  getTenantBySlug, 
  getMagazineBySlug,
  requireTenantRole,
  validateRequestBody,
  checkRateLimit
} from '../lib/api/utils.js';
import { dbService } from '../lib/database/firebase.js';

/**
 * POST /api/analytics/ingest
 * Ingest analytics events (public endpoint with rate limiting)
 */
export async function ingestAnalyticsEvent(request) {
  try {
    // Check rate limiting (prevent abuse)
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `analytics:${clientIP}`;
    const rateLimit = await checkRateLimit(rateLimitKey, 100, 3600); // 100 events per hour
    
    if (!rateLimit.allowed) {
      return Response.json(
        createResponse(null, { code: '429_RATE_LIMITED', message: 'Too many analytics events' }),
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      tenantSlug,
      magazineSlug,
      issueSlug,
      articleId,
      event,
      payload
    } = validateRequestBody(body, [
      'tenantSlug',
      'magazineSlug',
      'issueSlug',
      'event',
      'payload'
    ]);

    // Validate event type
    const validEvents = ['view', 'page_turn', 'cta_click', 'ad_click', 'share'];
    if (!validEvents.includes(event)) {
      return Response.json(
        createResponse(null, { code: '400_BAD_REQUEST', message: 'Invalid event type' }),
        { status: 400 }
      );
    }

    // Get tenant and magazine (to validate they exist)
    const tenant = await getTenantBySlug(tenantSlug);
    const magazine = await getMagazineBySlug(tenant.id, magazineSlug);

    // Verify the issue exists and is published (for public events)
    try {
      const issue = await dbService.issues.getPublished(tenant.id, magazine.id, issueSlug);
      if (!issue) {
        throw new Error('Issue not found or not published');
      }
    } catch (error) {
      return Response.json(
        createResponse(null, { code: '404_NOT_FOUND', message: 'Issue not found or not published' }),
        { status: 404 }
      );
    }

    // Create analytics event
    const analyticsData = {
      tenantId: `/tenants/${tenant.id}`,
      magazineId: `/tenants/${tenant.id}/magazines/${magazine.id}`,
      issueSlug,
      articleId: articleId || null,
      event,
      payload: {
        ...payload,
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
        ip: clientIP,
        timestamp: new Date().toISOString()
      }
    };

    await dbService.analytics.create(analyticsData);

    return Response.json(createResponse({ recorded: true }));

  } catch (error) {
    console.error('Error ingesting analytics event:', error);
    return Response.json(
      createResponse(null, error),
      { status: error.statusCode || 500 }
    );
  }
}

/**
 * GET /api/analytics/summary
 * Get analytics summary for dashboard (authenticated)
 */
export async function getAnalyticsSummary(request) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    // Get query parameters
    const url = new URL(request.url);
    const tenantSlug = url.searchParams.get('tenantSlug');
    const magazineSlug = url.searchParams.get('magazineSlug');
    const range = url.searchParams.get('range') || '30d';
    const issueSlug = url.searchParams.get('issueSlug'); // optional

    if (!tenantSlug) {
      return Response.json(
        createResponse(null, { code: '400_BAD_REQUEST', message: 'tenantSlug is required' }),
        { status: 400 }
      );
    }

    // Get tenant
    const tenant = await getTenantBySlug(tenantSlug);

    // Check permissions
    await requireTenantRole(user.uid, tenant.id, ['owner', 'editor']);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get analytics data
    let analyticsData;
    if (issueSlug && magazineSlug) {
      // Get magazine to validate
      const magazine = await getMagazineBySlug(tenant.id, magazineSlug);
      analyticsData = await dbService.analytics.getByIssue(tenant.id, magazine.id, issueSlug, startDate, endDate);
    } else {
      analyticsData = await dbService.analytics.getByTenant(tenant.id, startDate, endDate);
    }

    // Process analytics data
    const summary = processAnalyticsData(analyticsData, range);

    return Response.json(createResponse({
      summary,
      range,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalEvents: analyticsData.length
    }));

  } catch (error) {
    console.error('Error getting analytics summary:', error);
    return Response.json(
      createResponse(null, error),
      { status: error.statusCode || 500 }
    );
  }
}

/**
 * GET /api/analytics/detailed
 * Get detailed analytics data for charts and reports
 */
export async function getDetailedAnalytics(request) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    // Get query parameters
    const url = new URL(request.url);
    const tenantSlug = url.searchParams.get('tenantSlug');
    const magazineSlug = url.searchParams.get('magazineSlug');
    const issueSlug = url.searchParams.get('issueSlug');
    const range = url.searchParams.get('range') || '30d';
    const groupBy = url.searchParams.get('groupBy') || 'day'; // day, hour, week

    if (!tenantSlug) {
      return Response.json(
        createResponse(null, { code: '400_BAD_REQUEST', message: 'tenantSlug is required' }),
        { status: 400 }
      );
    }

    // Get tenant
    const tenant = await getTenantBySlug(tenantSlug);

    // Check permissions
    await requireTenantRole(user.uid, tenant.id, ['owner', 'editor']);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '24h':
        startDate.setHours(endDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get analytics data
    let analyticsData;
    if (issueSlug && magazineSlug) {
      const magazine = await getMagazineBySlug(tenant.id, magazineSlug);
      analyticsData = await dbService.analytics.getByIssue(tenant.id, magazine.id, issueSlug, startDate, endDate);
    } else {
      analyticsData = await dbService.analytics.getByTenant(tenant.id, startDate, endDate);
    }

    // Process detailed analytics
    const detailed = processDetailedAnalytics(analyticsData, groupBy, startDate, endDate);

    return Response.json(createResponse({
      detailed,
      range,
      groupBy,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalEvents: analyticsData.length
    }));

  } catch (error) {
    console.error('Error getting detailed analytics:', error);
    return Response.json(
      createResponse(null, error),
      { status: error.statusCode || 500 }
    );
  }
}

// Helper functions for processing analytics data
function processAnalyticsData(events, range) {
  const summary = {
    totalViews: 0,
    totalPageTurns: 0,
    totalCtaClicks: 0,
    totalAdClicks: 0,
    totalShares: 0,
    uniqueVisitors: new Set(),
    deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
    topPages: {},
    topArticles: {},
    averageSessionTime: 0,
    bounceRate: 0
  };

  const sessions = {};

  events.forEach(event => {
    // Count events by type
    switch (event.event) {
      case 'view':
        summary.totalViews++;
        break;
      case 'page_turn':
        summary.totalPageTurns++;
        break;
      case 'cta_click':
        summary.totalCtaClicks++;
        break;
      case 'ad_click':
        summary.totalAdClicks++;
        break;
      case 'share':
        summary.totalShares++;
        break;
    }

    // Track unique visitors (simplified using IP)
    if (event.payload?.ip) {
      summary.uniqueVisitors.add(event.payload.ip);
    }

    // Device breakdown
    const device = event.payload?.device || 'desktop';
    if (summary.deviceBreakdown[device] !== undefined) {
      summary.deviceBreakdown[device]++;
    }

    // Top pages
    if (event.payload?.page) {
      const page = `Page ${event.payload.page}`;
      summary.topPages[page] = (summary.topPages[page] || 0) + 1;
    }

    // Top articles
    if (event.articleId) {
      summary.topArticles[event.articleId] = (summary.topArticles[event.articleId] || 0) + 1;
    }

    // Session tracking (simplified)
    const sessionKey = `${event.payload?.ip || 'unknown'}_${event.issueSlug}`;
    if (!sessions[sessionKey]) {
      sessions[sessionKey] = {
        start: new Date(event.createdAt?.seconds * 1000 || event.createdAt),
        end: new Date(event.createdAt?.seconds * 1000 || event.createdAt),
        events: 1
      };
    } else {
      sessions[sessionKey].end = new Date(event.createdAt?.seconds * 1000 || event.createdAt);
      sessions[sessionKey].events++;
    }
  });

  // Calculate session metrics
  const sessionValues = Object.values(sessions);
  if (sessionValues.length > 0) {
    const totalSessionTime = sessionValues.reduce((sum, session) => {
      return sum + (session.end - session.start);
    }, 0);
    
    summary.averageSessionTime = Math.round(totalSessionTime / sessionValues.length / 1000); // seconds
    summary.bounceRate = Math.round((sessionValues.filter(s => s.events === 1).length / sessionValues.length) * 100);
  }

  // Convert sets to counts
  summary.uniqueVisitors = summary.uniqueVisitors.size;

  // Convert objects to sorted arrays
  summary.topPages = Object.entries(summary.topPages)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([page, count]) => ({ page, count }));

  summary.topArticles = Object.entries(summary.topArticles)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([articleId, count]) => ({ articleId, count }));

  return summary;
}

function processDetailedAnalytics(events, groupBy, startDate, endDate) {
  const detailed = {
    timeline: [],
    eventBreakdown: {},
    deviceTrends: {},
    pagePerformance: {},
    hourlyDistribution: Array(24).fill(0)
  };

  // Create time buckets
  const buckets = createTimeBuckets(startDate, endDate, groupBy);
  const bucketMap = {};

  buckets.forEach(bucket => {
    bucketMap[bucket.key] = {
      timestamp: bucket.timestamp,
      views: 0,
      pageTurns: 0,
      ctaClicks: 0,
      adClicks: 0,
      shares: 0
    };
  });

  // Process events
  events.forEach(event => {
    const eventDate = new Date(event.createdAt?.seconds * 1000 || event.createdAt);
    const bucketKey = getBucketKey(eventDate, groupBy);
    
    if (bucketMap[bucketKey]) {
      switch (event.event) {
        case 'view':
          bucketMap[bucketKey].views++;
          break;
        case 'page_turn':
          bucketMap[bucketKey].pageTurns++;
          break;
        case 'cta_click':
          bucketMap[bucketKey].ctaClicks++;
          break;
        case 'ad_click':
          bucketMap[bucketKey].adClicks++;
          break;
        case 'share':
          bucketMap[bucketKey].shares++;
          break;
      }
    }

    // Event breakdown
    detailed.eventBreakdown[event.event] = (detailed.eventBreakdown[event.event] || 0) + 1;

    // Device trends
    const device = event.payload?.device || 'desktop';
    detailed.deviceTrends[device] = (detailed.deviceTrends[device] || 0) + 1;

    // Page performance
    if (event.payload?.page) {
      const page = `Page ${event.payload.page}`;
      if (!detailed.pagePerformance[page]) {
        detailed.pagePerformance[page] = { views: 0, interactions: 0 };
      }
      
      if (event.event === 'view') {
        detailed.pagePerformance[page].views++;
      } else {
        detailed.pagePerformance[page].interactions++;
      }
    }

    // Hourly distribution
    const hour = eventDate.getHours();
    detailed.hourlyDistribution[hour]++;
  });

  // Convert bucket map to timeline array
  detailed.timeline = Object.values(bucketMap).sort((a, b) => a.timestamp - b.timestamp);

  return detailed;
}

function createTimeBuckets(startDate, endDate, groupBy) {
  const buckets = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    buckets.push({
      key: getBucketKey(current, groupBy),
      timestamp: new Date(current)
    });

    switch (groupBy) {
      case 'hour':
        current.setHours(current.getHours() + 1);
        break;
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      default:
        current.setDate(current.getDate() + 1);
    }
  }

  return buckets;
}

function getBucketKey(date, groupBy) {
  switch (groupBy) {
    case 'hour':
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
    case 'day':
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
    default:
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
}

// Export route handlers for Next.js API routes
export const analyticsHandlers = {
  ingest: ingestAnalyticsEvent,
  summary: getAnalyticsSummary,
  detailed: getDetailedAnalytics
};
