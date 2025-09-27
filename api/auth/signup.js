import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      email,
      password,
      businessName,
      website,
      industry,
      targetAudience,
      voiceTone,
      contentFocus,
      goals,
      plan
    } = req.body;

    // Validate required fields
    if (!email || !password || !businessName || !website) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create user in Firebase Auth (this should be done on client-side)
    // Here we just verify the token and create the user profile
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Create user profile in Firestore
    const userProfile = {
      uid,
      email,
      businessName,
      website,
      industry,
      targetAudience,
      voiceTone,
      contentFocus,
      goals,
      plan,
      createdAt: new Date().toISOString(),
      magazines: [],
      settings: {
        notificationsEnabled: true,
        autoGenerate: true,
        generateDay: 1, // First day of month
      }
    };

    await db.collection('users').doc(uid).set(userProfile);

    // Create initial magazine blueprint
    const blueprint = {
      userId: uid,
      businessName,
      website,
      branding: {
        primaryColor: '#4f46e5',
        secondaryColor: '#7c3aed',
        fontFamily: 'Inter',
        logo: null
      },
      content: {
        voiceTone,
        contentFocus,
        goals,
        sections: [
          'Cover Story',
          'Industry News',
          'How-To Guide',
          'Case Study',
          'Company Spotlight',
          'Resources'
        ]
      },
      layout: {
        template: plan === 'basic' ? 'standard' : 'premium',
        pageCount: plan === 'enterprise' ? 24 : 12,
        adSlots: plan !== 'basic' ? ['p4', 'p10'] : []
      },
      createdAt: new Date().toISOString()
    };

    await db.collection('blueprints').doc(uid).set(blueprint);

    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        uid,
        email,
        businessName,
        plan
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
