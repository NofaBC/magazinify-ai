/**
 * Magazine Routes
 * 
 * API routes for magazine operations
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const magazineController = require('../controllers/magazine');

// Public routes (no auth required)

/**
 * GET /api/magazine/:tenantId/:issueId
 * Get a public magazine by ID
 */
router.get('/:tenantId/:issueId', magazineController.getPublicMagazine);

/**
 * POST /api/magazine/:tenantId/:issueId/view
 * Track a magazine view
 */
router.post('/:tenantId/:issueId/view', magazineController.trackMagazineView);

/**
 * POST /api/magazine/:tenantId/:issueId/click
 * Track a magazine link click
 */
router.post('/:tenantId/:issueId/click', magazineController.trackMagazineLinkClick);

// Protected routes (auth required)

/**
 * All routes below require authentication
 */
router.use('/tenant/:tenantId/magazine', authMiddleware, tenantMiddleware);

/**
 * GET /api/tenant/:tenantId/magazine
 * Get all magazines for a tenant
 */
router.get('/tenant/:tenantId/magazine', magazineController.getMagazines);

/**
 * GET /api/tenant/:tenantId/magazine/eligibility
 * Check if a tenant is eligible for magazine creation
 */
router.get('/tenant/:tenantId/magazine/eligibility', magazineController.checkMagazineEligibility);

/**
 * POST /api/tenant/:tenantId/magazine
 * Create a new magazine
 */
router.post('/tenant/:tenantId/magazine', magazineController.createMagazine);

/**
 * GET /api/tenant/:tenantId/magazine/:issueId
 * Get a magazine by ID
 */
router.get('/tenant/:tenantId/magazine/:issueId', magazineController.getMagazine);

/**
 * GET /api/tenant/:tenantId/magazine/:issueId/analytics
 * Get analytics for a magazine
 */
router.get('/tenant/:tenantId/magazine/:issueId/analytics', magazineController.getMagazineAnalytics);

/**
 * POST /api/tenant/:tenantId/magazine/:issueId/retry
 * Retry magazine generation if it failed
 */
router.post('/tenant/:tenantId/magazine/:issueId/retry', magazineController.retryMagazineGeneration);

/**
 * DELETE /api/tenant/:tenantId/magazine/:issueId
 * Delete a magazine
 */
router.delete('/tenant/:tenantId/magazine/:issueId', magazineController.deleteMagazine);

module.exports = router;
