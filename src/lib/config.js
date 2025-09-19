// Environment configuration for Magazinify AI

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  },

  // Database Configuration (Firebase)
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  },

  // OpenAI Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-4o-mini',
    maxTokens: 4000,
  },

  // Vercel Blob Configuration
  blob: {
    token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN || '',
  },

  // Application Configuration
  app: {
    name: 'Magazinify AI™',
    version: '1.0.0',
    defaultSubdomain: 'app',
    baseUrl: import.meta.env.VITE_APP_BASE_URL || 'http://localhost:5173',
  },

  // Plan Configuration
  plans: {
    basic: {
      name: 'Basic',
      maxPages: 12,
      customDomain: false,
      premiumTemplates: false,
      advancedAnalytics: false,
      videoAudioEmbeds: false,
      maxAdSlots: 2,
      teamRoles: false,
      maxMagazines: 1,
    },
    pro: {
      name: 'Pro',
      maxPages: 12,
      customDomain: true,
      premiumTemplates: true,
      advancedAnalytics: true,
      videoAudioEmbeds: true,
      maxAdSlots: 5,
      teamRoles: false,
      maxMagazines: 1,
    },
    customize: {
      name: 'Customize',
      maxPages: 24,
      customDomain: true,
      premiumTemplates: true,
      advancedAnalytics: true,
      videoAudioEmbeds: true,
      maxAdSlots: -1, // unlimited
      teamRoles: true,
      maxMagazines: -1, // unlimited
    },
  },

  // Default Blueprint Configuration
  defaultBlueprint: {
    brand: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f59e0b',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
    },
    voice: {
      tone: 'professional',
      style: 'informative',
      keywords: [],
    },
    defaultPageCount: 8,
    sections: [
      { id: 'cover', name: 'Cover Page', type: 'cover', order: 1 },
      { id: 'toc', name: 'Table of Contents', type: 'toc', order: 2 },
      { id: 'feature', name: 'Feature Article', type: 'article', order: 3 },
      { id: 'news', name: 'News & Updates', type: 'news', order: 4 },
      { id: 'insights', name: 'Industry Insights', type: 'article', order: 5 },
      { id: 'back-cover', name: 'Back Cover', type: 'back-cover', order: 6 },
    ],
    adSlots: [
      { key: 'p4', page: 4, position: 'full-page', dimensions: { width: 800, height: 1200 } },
      { key: 'p10', page: 10, position: 'half-page', dimensions: { width: 800, height: 600 } },
    ],
  },
};

// Feature flags based on plan
export const getFeatureFlags = (plan) => {
  const planConfig = config.plans[plan] || config.plans.basic;
  
  return {
    customDomain: planConfig.customDomain,
    premiumTemplates: planConfig.premiumTemplates,
    advancedAnalytics: planConfig.advancedAnalytics,
    videoAudioEmbeds: planConfig.videoAudioEmbeds,
    teamRoles: planConfig.teamRoles,
    maxPages: planConfig.maxPages,
    maxAdSlots: planConfig.maxAdSlots,
    maxMagazines: planConfig.maxMagazines,
  };
};

export default config;
