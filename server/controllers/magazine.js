/**
 * Magazine Controller
 * 
 * Handles magazine-related API requests
 */

const { firestore, Timestamp } = require('../config/firebase');
const magazineGenerator = require('../services/magazineGenerator');
const logger = require('../utils/logger');

/**
 * Create a new magazine
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.createMagazine = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { websiteUrl, options, uploadedImages } = req.body;
    
    // Check eligibility
    const isEligible = await magazineGenerator.checkActivationEligibility(tenantId);
    
    if (!isEligible) {
      return res.status(403).json({
        success: false,
        message: 'Tenant is not eligible for magazine creation at this time'
      });
    }
    
    // Validate inputs
    if (!websiteUrl) {
      return res.status(400).json({
        success: false,
        message: 'Website URL is required'
      });
    }
    
    // Set the issue ID based on year-month
    const now = new Date();
    const issueId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Create issue document with initial state
    await firestore
      .collection(`tenants/${tenantId}/issues`)
      .doc(issueId)
      .set({
        id: issueId,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        websiteUrl,
        options,
        uploadedImages: uploadedImages || []
      });
    
    // Start magazine generation in the background
    magazineGenerator.generateMagazine(tenantId, websiteUrl, options)
      .then(result => {
        logger.info(`Magazine generation completed for tenant ${tenantId}, issue ${issueId}`);
      })
      .catch(error => {
        logger.error(`Magazine generation failed for tenant ${tenantId}, issue ${issueId}: ${error.message}`);
      });
    
    // Return success with issue ID
    return res.status(201).json({
      success: true,
      message: 'Magazine generation started',
      issueId
    });
  } catch (error) {
    logger.error(`Error in createMagazine: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error creating magazine',
      error: error.message
    });
  }
};

/**
 * Get a magazine by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.getMagazine = async (req, res) => {
  try {
    const { tenantId, issueId } = req.params;
    
    // Get magazine document
    const issueDoc = await firestore
      .collection(`tenants/${tenantId}/issues`)
      .doc(issueId)
      .get();
    
    if (!issueDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Magazine not found'
      });
    }
    
    const issue = issueDoc.data();
    
    // Get articles
    const articlesSnapshot = await firestore
      .collection(`tenants/${tenantId}/issues/${issueId}/articles`)
      .orderBy('index')
      .get();
    
    const articles = [];
    articlesSnapshot.forEach(doc => {
      articles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get images
    const imagesSnapshot = await firestore
      .collection(`tenants/${tenantId}/issues/${issueId}/images`)
      .orderBy('index')
      .get();
    
    const images = [];
    imagesSnapshot.forEach(doc => {
      images.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get ads
    const adsSnapshot = await firestore
      .collection(`tenants/${tenantId}/issues/${issueId}/ads`)
      .orderBy('index')
      .get();
    
    const ads = [];
    adsSnapshot.forEach(doc => {
      ads.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Include articles, images, and ads in response
    issue.articles = articles;
    issue.images = images;
    issue.ads = ads;
    
    return res.status(200).json({
      success: true,
      issue
    });
  } catch (error) {
    logger.error(`Error in getMagazine: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error getting magazine',
      error: error.message
    });
  }
};

/**
 * Get all magazines for a tenant
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.getMagazines = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Get all magazine documents
    const issuesSnapshot = await firestore
      .collection(`tenants/${tenantId}/issues`)
      .orderBy('createdAt', 'desc')
      .get();
    
    const issues = [];
    issuesSnapshot.forEach(doc => {
      issues.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return res.status(200).json({
      success: true,
      issues
    });
  } catch (error) {
    logger.error(`Error in getMagazines: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error getting magazines',
      error: error.message
    });
  }
};

/**
 * Check if a tenant is eligible for magazine creation
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.checkMagazineEligibility = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Check eligibility
    const isEligible = await magazineGenerator.checkActivationEligibility(tenantId);
    
    return res.status(200).json({
      success: true,
      isEligible,
      message: isEligible 
        ? 'Tenant is eligible for magazine creation' 
        : 'Tenant is not eligible for magazine creation at this time'
    });
  } catch (error) {
    logger.error(`Error in checkMagazineEligibility: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error checking magazine eligibility',
      error: error.message
    });
  }
};

/**
 * Get analytics for a magazine
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.getMagazineAnalytics = async (req, res) => {
  try {
    const { tenantId, issueId } = req.params;
    
    // Get magazine document to confirm it exists
    const issueDoc = await firestore
      .collection(`tenants/${tenantId}/issues`)
      .doc(issueId)
      .get();
    
    if (!issueDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Magazine not found'
      });
    }
    
    // Get analytics
    const analyticsSnapshot = await firestore
      .collection(`tenants/${tenantId}/issues/${issueId}/analytics`)
      .get();
    
    // Count views
    const views = analyticsSnapshot.docs
      .filter(doc => doc.data().type === 'view')
      .length;
    
    // Count and categorize clicks
    const clicks = analyticsSnapshot.docs
      .filter(doc => doc.data().type === 'click');
    
    const clicksByUrl = {};
    clicks.forEach(click => {
      const { url } = click.data();
      if (url) {
        clicksByUrl[url] = (clicksByUrl[url] || 0) + 1;
      }
    });
    
    // Get time series data for views and clicks
    const viewsByDate = {};
    const clicksByDate = {};
    
    analyticsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = new Date(data.createdAt.toDate()).toISOString().split('T')[0];
      
      if (data.type === 'view') {
        viewsByDate[date] = (viewsByDate[date] || 0) + 1;
      } else if (data.type === 'click') {
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;
      }
    });
    
    return res.status(200).json({
      success: true,
      analytics: {
        views,
        clicks: clicks.length,
        clicksByUrl,
        viewsByDate,
        clicksByDate
      }
    });
  } catch (error) {
    logger.error(`Error in getMagazineAnalytics: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error getting magazine analytics',
      error: error.message
    });
  }
};

/**
 * Track a magazine view
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.trackMagazineView = async (req, res) => {
  try {
    const { tenantId, issueId } = req.params;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Get magazine document to confirm it exists
    const issueDoc = await firestore
      .collection(`tenants/${tenantId}/issues`)
      .doc(issueId)
      .get();
    
    if (!issueDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Magazine not found'
      });
    }
    
    // Add view analytics
    await firestore
      .collection(`tenants/${tenantId}/issues/${issueId}/analytics`)
      .add({
        type: 'view',
        createdAt: Timestamp.now(),
        clientIp,
        userAgent,
        referrer: req.headers.referer || 'direct'
      });
    
    return res.status(200).json({
      success: true
    });
  } catch (error) {
    logger.error(`Error in trackMagazineView: ${error.message}`);
    // Return success anyway to avoid affecting user experience
    return res.status(200).json({
      success: true
    });
  }
};

/**
 * Track a magazine link click
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.trackMagazineLinkClick = async (req, res) => {
  try {
    const { tenantId, issueId } = req.params;
    const { url } = req.body;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }
    
    // Get magazine document to confirm it exists
    const issueDoc = await firestore
      .collection(`tenants/${tenantId}/issues`)
      .doc(issueId)
      .get();
    
    if (!issueDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Magazine not found'
      });
    }
    
    // Add click analytics
    await firestore
      .collection(`tenants/${tenantId}/issues/${issueId}/analytics`)
      .add({
        type: 'click',
        url,
        createdAt: Timestamp.now(),
        clientIp,
        userAgent,
        referrer: req.headers.referer || 'direct'
      });
    
    return res.status(200).json({
      success: true
    });
  } catch (error) {
    logger.error(`Error in trackMagazineLinkClick: ${error.message}`);
    // Return success anyway to avoid affecting user experience
    return res.status(200).json({
      success: true
    });
  }
};

/**
 * Get a public magazine by ID (no auth required)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.getPublicMagazine = async (req, res) => {
  try {
    const { tenantId, issueId } = req.params;
    
    // Get magazine document
    const issueDoc = await firestore
      .collection(`tenants/${tenantId}/issues`)
      .doc(issueId)
      .get();
    
    if (!issueDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Magazine not found'
      });
    }
    
    const issue = issueDoc.data();
    
    // Only published magazines are accessible
    if (issue.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Magazine not found or not published'
      });
    }
    
    // Return only necessary public information
    const publicIssue = {
      id: issue.id,
      title: issue.title || `${tenantId} Magazine - ${issueId}`,
      pdfUrl: issue.pdfUrl,
      flipbookUrl: issue.flipbookUrl,
      pageUrls: issue.pageUrls,
      pageCount: issue.pageCount,
      publishedAt: issue.publishedAt
    };
    
    // Get tenant info
    const tenantDoc = await firestore
      .collection('tenants')
      .doc(tenantId)
      .get();
    
    if (tenantDoc.exists) {
      const tenant = tenantDoc.data();
      publicIssue.tenant = {
        id: tenantId,
        name: tenant.businessName,
        logo: tenant.brandAssets?.logo,
        website: tenant.website
      };
    }
    
    return res.status(200).json({
      success: true,
      issue: publicIssue
    });
  } catch (error) {
    logger.error(`Error in getPublicMagazine: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error getting public magazine',
      error: error.message
    });
  }
};

/**
 * Retry magazine generation if it failed
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.retryMagazineGeneration = async (req, res) => {
  try {
    const { tenantId, issueId } = req.params;
    
    // Get magazine document
    const issueDoc = await firestore
      .collection(`tenants/${tenantId}/issues`)
      .doc(issueId)
      .get();
    
    if (!issueDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Magazine not found'
      });
    }
    
    const issue = issueDoc.data();
    
    // Only retry if status is 'error'
    if (issue.status !== 'error') {
      return res.status(400).json({
        success: false,
        message: 'Magazine is not in error state'
      });
    }
    
    // Update status to 'retrying'
    await firestore
      .collection(`tenants/${tenantId}/issues`)
      .doc(issueId)
      .update({
        status: 'retrying',
        updatedAt: Timestamp.now()
      });
    
    // Start magazine generation in the background
    magazineGenerator.generateMagazine(tenantId, issue.websiteUrl, issue.options)
      .then(result => {
        logger.info(`Magazine generation retry completed for tenant ${tenantId}, issue ${issueId}`);
      })
      .catch(error => {
        logger.error(`Magazine generation retry failed for tenant ${tenantId}, issue ${issueId}: ${error.message}`);
      });
    
    return res.status(200).json({
      success: true,
      message: 'Magazine generation retry started'
    });
  } catch (error) {
    logger.error(`Error in retryMagazineGeneration: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error retrying magazine generation',
      error: error.message
    });
  }
};

/**
 * Delete a magazine
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.deleteMagazine = async (req, res) => {
  try {
    const { tenantId, issueId } = req.params;
    
    // Get magazine document
    const issueDoc = await firestore
      .collection(`tenants/${tenantId}/issues`)
      .doc(issueId)
      .get();
    
    if (!issueDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Magazine not found'
      });
    }
    
    // Delete subcollections first
    const deleteSubcollection = async (subcollectionName) => {
      const snapshot = await firestore
        .collection(`tenants/${tenantId}/issues/${issueId}/${subcollectionName}`)
        .get();
      
      const batch = firestore.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    };
    
    // Delete subcollections
    await deleteSubcollection('articles');
    await deleteSubcollection('images');
    await deleteSubcollection('ads');
    await deleteSubcollection('analytics');
    
    // Delete the issue document
    await firestore
      .collection(`tenants/${tenantId}/issues`)
      .doc(issueId)
      .delete();
    
    // Note: We're not deleting files from storage to keep the process simple,
    // but in production you'd want to delete the associated files as well.
    
    return res.status(200).json({
      success: true,
      message: 'Magazine deleted successfully'
    });
  } catch (error) {
    logger.error(`Error in deleteMagazine: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error deleting magazine',
      error: error.message
    });
  }
};
