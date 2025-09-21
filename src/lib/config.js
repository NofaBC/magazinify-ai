// Environment configuration
export const config = {
  // Firebase configuration
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },

  // OpenRouter/OpenAI configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENAI_API_KEY,
    baseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    model: 'openai/gpt-4o-mini',
    maxTokens: 2000,
  },

  // Vercel Blob configuration
  blob: {
    token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN,
  },

  // Application configuration
  app: {
    baseUrl: import.meta.env.VITE_APP_BASE_URL || 'http://localhost:5173',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173/api',
    name: 'Magazinify AI™',
    description: 'AI-Powered Magazine Publishing Platform',
  },

  // Feature flags
  features: {
    aiGeneration: true,
    analytics: true,
    customDomains: true,
    multiTenant: true,
  },

  // Plan configurations
  plans: {
    basic: {
      name: 'Basic',
      price: 29,
      features: [
        'Up to 12 pages per issue',
        'Basic templates',
        'Shared subdomain',
        'Basic analytics',
        'Email support'
      ],
      limits: {
        maxPages: 12,
        maxIssuesPerMonth: 1,
        customDomain: false,
        advancedAnalytics: false,
      }
    },
    pro: {
      name: 'Pro',
      price: 79,
      features: [
        'Up to 24 pages per issue',
        'Premium templates',
        'Custom domain',
        'Advanced analytics',
        'Video/audio embeds',
        'Priority support'
      ],
      limits: {
        maxPages: 24,
        maxIssuesPerMonth: 4,
        customDomain: true,
        advancedAnalytics: true,
      }
    },
    customize: {
      name: 'Customize',
      price: 199,
      features: [
        'Unlimited pages',
        'Custom templates',
        'Multiple magazines',
        'Team collaboration',
        'White-label options',
        'Dedicated support'
      ],
      limits: {
        maxPages: -1, // unlimited
        maxIssuesPerMonth: -1, // unlimited
        customDomain: true,
        advancedAnalytics: true,
        multiMagazine: true,
        teamRoles: true,
      }
    }
  }
};

export default config;
