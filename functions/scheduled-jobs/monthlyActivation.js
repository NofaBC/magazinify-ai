/**
 * Monthly Magazine Activation Function
 * 
 * This function runs on a schedule at the beginning of each month
 * to activate magazine generation for all eligible tenants.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();
const logger = functions.logger;
const runtimeOpts = {
  timeoutSeconds: 540, // 9 minutes
  memory: '2GB'
};

/**
 * Scheduled function that runs on the 1st of each month
 * to activate magazine generation for eligible tenants
 */
exports.monthlyMagazineActivation = functions
  .runWith(runtimeOpts)
  .pubsub
  .schedule('0 0 1 * *') // Run at midnight on the 1st of each month
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      logger.info('Starting monthly magazine activation');
      
      // Get all tenants with active subscriptions
      const tenantsSnapshot = await firestore
        .collection('tenants')
        .where('subscription.status', '==', 'active')
        .get();
      
      logger.info(`Found ${tenantsSnapshot.size} tenants with active subscriptions`);
      
      // Current month in YYYY-MM format
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // Track successes and failures
      let successCount = 0;
      let failureCount = 0;
      
      // Process each tenant
      for (const tenantDoc of tenantsSnapshot.docs) {
        const tenant = tenantDoc.data();
        const tenantId = tenantDoc.id;
        
        try {
          // Check if tenant has a website URL
          if (!tenant.website) {
            logger.warn(`Tenant ${tenantId} has no website URL, skipping`);
            failureCount++;
            continue;
          }
          
          // Check if subscription is active and not expired
          const subscriptionEnd = tenant.subscription?.currentPeriodEnd?.toDate();
          if (!subscriptionEnd || subscriptionEnd < now) {
            logger.warn(`Tenant ${tenantId} subscription has expired, skipping`);
            failureCount++;
            continue;
          }
          
          // Check if magazine already exists for this month
          const existingIssue = await firestore
            .collection(`tenants/${tenantId}/issues`)
            .doc(currentMonth)
            .get();
            
          if (existingIssue.exists) {
            logger.info(`Tenant ${tenantId} already has a magazine for ${currentMonth}, skipping`);
            continue;
          }
          
          // Create initial issue document
          await firestore
            .collection(`tenants/${tenantId}/issues`)
            .doc(currentMonth)
            .set({
              id: currentMonth,
              status: 'pending',
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              websiteUrl: tenant.website,
              options: {
                includeNofaAd: true,
                brandOptions: {
                  useWebsiteColors: true
                }
              },
              activatedBy: 'system'
            });
          
          // Call the API to generate the magazine
          // In a production environment, you would use a task queue or direct function call
          // This example uses the API for simplicity
          const apiUrl = process.env.API_URL || 'https://api.magazinify.ai';
          
          await axios.post(
            `${apiUrl}/api/tenant/${tenantId}/magazine/generate`,
            {
              websiteUrl: tenant.website,
              options: {
                includeNofaAd: true,
                brandOptions: {
                  useWebsiteColors: true
                }
              },
              activatedBy: 'system'
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'X-API-Key': process.env.API_KEY
              }
            }
          );
          
          logger.info(`Successfully activated magazine generation for tenant ${tenantId}`);
          successCount++;
        } catch (tenantError) {
          logger.error(`Error processing tenant ${tenantId}:`, tenantError);
          
          // Update issue status to error if it was created
          const issueDoc = await firestore
            .collection(`tenants/${tenantId}/issues`)
            .doc(currentMonth)
            .get();
            
          if (issueDoc.exists) {
            await firestore
              .collection(`tenants/${tenantId}/issues`)
              .doc(currentMonth)
              .update({
                status: 'error',
                error: tenantError.message,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              });
          }
          
          failureCount++;
        }
        
        // Brief pause to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      logger.info(`Monthly magazine activation completed. Success: ${successCount}, Failure: ${failureCount}`);
      
      // Log activation results to a Firestore document for monitoring
      await firestore
        .collection('system')
        .doc('activationLogs')
        .collection('monthlyActivation')
        .doc(currentMonth)
        .set({
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          month: currentMonth,
          totalTenants: tenantsSnapshot.size,
          successCount,
          failureCount
        });
      
      return null;
    } catch (error) {
      logger.error('Error in monthly magazine activation:', error);
      throw error;
    }
  });

/**
 * HTTP function to manually trigger magazine activation for a tenant
 * This is useful for testing or for tenants who need immediate activation
 */
exports.triggerMagazineActivation = functions
  .runWith(runtimeOpts)
  .https
  .onCall(async (data, context) => {
    try {
      // Verify authentication
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'Authentication required'
        );
      }
      
      // Verify admin role or tenant owner
      const isAdmin = context.auth.token.admin === true;
      const { tenantId } = data;
      
      if (!tenantId) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Tenant ID is required'
        );
      }
      
      // Check if user is tenant owner if not admin
      if (!isAdmin) {
        const tenantDoc = await firestore
          .collection('tenants')
          .doc(tenantId)
          .get();
          
        if (!tenantDoc.exists || tenantDoc.data().ownerId !== context.auth.uid) {
          throw new functions.https.HttpsError(
            'permission-denied',
            'Only tenant owners or admins can trigger activation'
          );
        }
      }
      
      // Get tenant data
      const tenantDoc = await firestore
        .collection('tenants')
        .doc(tenantId)
        .get();
        
      if (!tenantDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Tenant not found'
        );
      }
      
      const tenant = tenantDoc.data();
      
      // Check if tenant has a website URL
      if (!tenant.website && !data.websiteUrl) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Website URL is required'
        );
      }
      
      // Check if subscription is active
      if (tenant.subscription?.status !== 'active') {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Tenant subscription is not active'
        );
      }
      
      // Current month in YYYY-MM format
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // Check if magazine already exists for this month
      const existingIssue = await firestore
        .collection(`tenants/${tenantId}/issues`)
        .doc(currentMonth)
        .get();
        
      if (existingIssue.exists) {
        throw new functions.https.HttpsError(
          'already-exists',
          `Magazine already exists for ${currentMonth}`
        );
      }
      
      // Create initial issue document
      await firestore
        .collection(`tenants/${tenantId}/issues`)
        .doc(currentMonth)
        .set({
          id: currentMonth,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          websiteUrl: data.websiteUrl || tenant.website,
          options: data.options || {
            includeNofaAd: true,
            brandOptions: {
              useWebsiteColors: true
            }
          },
          activatedBy: context.auth.uid
        });
      
      // Call the API to generate the magazine
      const apiUrl = process.env.API_URL || 'https://api.magazinify.ai';
      
      await axios.post(
        `${apiUrl}/api/tenant/${tenantId}/magazine/generate`,
        {
          websiteUrl: data.websiteUrl || tenant.website,
          options: data.options || {
            includeNofaAd: true,
            brandOptions: {
              useWebsiteColors: true
            }
          },
          activatedBy: context.auth.uid
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.API_KEY
          }
        }
      );
      
      logger.info(`Manually triggered magazine generation for tenant ${tenantId} by user ${context.auth.uid}`);
      
      return {
        success: true,
        message: 'Magazine generation triggered successfully',
        issueId: currentMonth
      };
    } catch (error) {
      logger.error('Error in triggerMagazineActivation:', error);
      
      throw new functions.https.HttpsError(
        'internal',
        error.message
      );
    }
  });
