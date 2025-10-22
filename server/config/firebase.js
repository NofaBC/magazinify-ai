/**
 * Firebase Admin SDK Configuration
 * 
 * This file initializes the Firebase Admin SDK and exports the required services.
 */

const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Check if we're running in a Firebase Cloud Function environment
const isFirebaseFunction = process.env.FUNCTION_NAME || process.env.FUNCTION_TARGET;

let serviceAccount;

// In production and staging, use the environment variable for service account
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error('Error parsing Firebase service account:', error);
    process.exit(1);
  }
}

// Initialize Firebase Admin SDK
// If running in a Firebase Cloud Function, we don't need to initialize (it's already initialized)
if (!admin.apps.length && !isFirebaseFunction) {
  admin.initializeApp({
    credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  console.log('Firebase Admin SDK initialized');
}

// Export Firebase services
const auth = admin.auth();
const firestore = admin.firestore();
const storage = admin.storage();

// Configure Firestore
if (process.env.NODE_ENV === 'development') {
  firestore.settings({ 
    host: 'localhost:8080', 
    ssl: false 
  });
}

module.exports = {
  admin,
  auth,
  firestore,
  storage,
  FieldValue: admin.firestore.FieldValue,
  Timestamp: admin.firestore.Timestamp
};
