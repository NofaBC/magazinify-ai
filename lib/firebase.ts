import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
function initializeFirebase() {
  // Check if already initialized
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Validate required environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    console.warn('Firebase configuration incomplete. Some features will be disabled.');
    return null;
  }

  try {
    // Initialize with service account credentials
    const app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
      }),
      storageBucket,
    });

    console.log(`Firebase initialized for project: ${projectId}`);
    return app;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return null;
  }
}

// Initialize and export services
const app = initializeFirebase();

export const db = app ? getFirestore(app) : null;
export const bucket = app ? getStorage(app).bucket() : null;
export const isFirebaseReady = !!app;

export default {
  db,
  bucket,
  isFirebaseReady,
  initializeFirebase
};
