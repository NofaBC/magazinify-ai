import { dbService } from './firebase.js';
import { v4 as uuidv4 } from 'uuid';

// Initialize database with seed data for development
export const initializeDatabase = async () => {
  console.log('Initializing database with seed data...');
  
  try {
    // Create demo tenant
    const demoTenant = await createDemoTenant();
    console.log('Created demo tenant:', demoTenant.id);
    
    // Create demo magazine
    const demoMagazine = await createDemoMagazine(demoTenant.id);
    console.log('Created demo magazine:', demoMagazine.id);
    
    // Create demo blueprint
    const demoBlueprint = await createDemoBlueprint(demoTenant.id, demoMagazine.id);
    console.log('Created demo blueprint');
    
    // Create demo issue with articles
    const demoIssue = await createDemoIssue(demoTenant.id, demoMagazine.id);
    console.log('Created demo issue:', demoIssue.id);
    
    return {
      tenant: demoTenant,
      magazine: demoMagazine,
      blueprint: demoBlueprint,
      issue: demoIssue,
    };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Create a demo tenant for development
export const createDemoTenant = async () => {
  const tenantData = {
    name: 'Demo Publishing Co.',
    slug: 'demo-publishing',
    email: 'demo@magazinify.ai',
    plan: 'pro',
    billingStatus: 'active',
    featureFlags: {
      hasCustomDomain: true,
      customDomain: 'mag.demo.ai',
      maxPages: 12,
      maxMagazines: 2,
      premiumTemplates: true,
      richMedia: true
    }
  };
  
  return await dbService.tenants.create(tenantData);
};

// Create a demo magazine
export const createDemoMagazine = async (tenantId) => {
  const magazineData = {
    title: 'Tech Insights Showcase',
    slug: 'showcase',
    description: 'Monthly technology and business insights',
    theme: {
      fontHead: 'Playfair Display',
      fontBody: 'Inter',
      primary: '#1e293b',
      accent: '#38bdf8'
    }
  };
  
  return await dbService.magazines.create(tenantId, magazineData);
};

// Create a demo blueprint
export const createDemoBlueprint = async (tenantId, magazineId) => {
  const blueprintData = {
    structure: {
      pages: 12,
      sections: ['cover', 'toc', 'feature', 'spotlight', 'tips', 'ads', 'closing'],
      adSlots: ['p4', 'p10']
    },
    voice: {
      tone: 'professional, informative',
      readingLevel: '8-10'
    },
    niche: {
      topics: ['AI for SMB', 'Automation', 'Digital Transformation'],
      geo: ['Global', 'North America'],
      keywords: ['productivity', 'innovation', 'technology', 'business growth']
    },
    sources: {
      rss: [
        'https://techcrunch.com/feed/',
        'https://www.wired.com/feed/'
      ],
      uploadsAllowed: true
    },
    cadence: 'monthly',
    approvalMode: 'semi_auto'
  };
  
  return await dbService.blueprints.create(tenantId, magazineId, blueprintData);
};

// Create a demo issue with articles
export const createDemoIssue = async (tenantId, magazineId) => {
  const currentDate = new Date();
  const issueSlug = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  const issueData = {
    title: `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`,
    slug: issueSlug,
    status: 'published',
    coverUrl: null, // Will be generated later
    pdfUrl: null, // Will be generated later
    publishedAt: currentDate,
    meta: {
      ogTitle: `Tech Insights - ${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`,
      ogDescription: 'Latest technology trends and business insights',
      ogImage: null
    }
  };
  
  const issue = await dbService.issues.create(tenantId, magazineId, issueData);
  
  // Create demo articles
  const articles = await createDemoArticles(tenantId, magazineId, issueSlug);
  
  // Create demo ad slots
  await createDemoAdSlots(tenantId, magazineId, issueSlug);
  
  return { ...issue, articles };
};

// Create demo articles for an issue
export const createDemoArticles = async (tenantId, magazineId, issueSlug) => {
  const articles = [
    {
      position: 1,
      slug: 'ai-revolution-in-business',
      title: 'The AI Revolution in Modern Business',
      html: `
        <h1>The AI Revolution in Modern Business</h1>
        <p class="lead">Artificial Intelligence is transforming how businesses operate, compete, and serve their customers in unprecedented ways.</p>
        
        <h2>The Current Landscape</h2>
        <p>Today's business environment is characterized by rapid technological advancement and increasing customer expectations. Companies that embrace AI technologies are finding themselves at a significant competitive advantage, able to process data faster, make more informed decisions, and deliver personalized experiences at scale.</p>
        
        <h2>Key Areas of Impact</h2>
        <p>AI is making its mark across various business functions:</p>
        <ul>
          <li><strong>Customer Service:</strong> Chatbots and virtual assistants provide 24/7 support</li>
          <li><strong>Marketing:</strong> Predictive analytics enable targeted campaigns</li>
          <li><strong>Operations:</strong> Automation streamlines repetitive tasks</li>
          <li><strong>Finance:</strong> Fraud detection and risk assessment improve security</li>
        </ul>
        
        <blockquote>
          "The companies that will thrive in the next decade are those that view AI not as a replacement for human intelligence, but as an amplifier of human capability."
        </blockquote>
        
        <h2>Implementation Strategies</h2>
        <p>Successful AI implementation requires a strategic approach. Organizations should start with clear objectives, invest in data quality, and ensure their teams are prepared for the transition. The key is to begin with pilot projects that demonstrate value before scaling across the organization.</p>
        
        <h2>Looking Forward</h2>
        <p>As AI technology continues to evolve, we can expect even more sophisticated applications. From generative AI creating content to advanced machine learning models predicting market trends, the possibilities are endless. The question isn't whether AI will transform business—it's how quickly organizations can adapt to harness its power.</p>
      `,
      heroUrl: null, // Will be generated later
      tags: ['AI', 'Business', 'Technology', 'Digital Transformation'],
      meta: {
        readingTime: 5,
        wordCount: 350
      }
    },
    {
      position: 2,
      slug: 'cybersecurity-trends-2025',
      title: 'Cybersecurity Trends to Watch in 2025',
      html: `
        <h1>Cybersecurity Trends to Watch in 2025</h1>
        <p class="lead">As digital threats evolve, so must our defense strategies. Here are the key cybersecurity trends shaping the year ahead.</p>
        
        <h2>Zero Trust Architecture</h2>
        <p>The traditional security perimeter is dissolving. Zero Trust architecture assumes no implicit trust and continuously validates every transaction, making it essential for modern cybersecurity strategies.</p>
        
        <h2>AI-Powered Threats and Defenses</h2>
        <p>While AI enhances security capabilities, cybercriminals are also leveraging these technologies. The arms race between AI-powered attacks and defenses is intensifying, requiring constant vigilance and adaptation.</p>
        
        <blockquote>
          "In cybersecurity, the only constant is change. Organizations must build adaptive security frameworks that can evolve with emerging threats."
        </blockquote>
        
        <h2>Cloud Security Evolution</h2>
        <p>As cloud adoption accelerates, security strategies must evolve. Multi-cloud environments present new challenges, requiring specialized tools and expertise to maintain security across diverse platforms.</p>
        
        <h2>Human-Centric Security</h2>
        <p>Despite technological advances, human error remains a significant vulnerability. Security awareness training and creating a culture of security consciousness are more important than ever.</p>
      `,
      heroUrl: null,
      tags: ['Cybersecurity', 'Technology', 'Cloud', 'AI'],
      meta: {
        readingTime: 3,
        wordCount: 220
      }
    },
    {
      position: 3,
      slug: 'remote-work-productivity-tips',
      title: '10 Productivity Tips for Remote Teams',
      html: `
        <h1>10 Productivity Tips for Remote Teams</h1>
        <p class="lead">Remote work is here to stay. These proven strategies will help your team maintain high productivity while working from anywhere.</p>
        
        <h2>1. Establish Clear Communication Protocols</h2>
        <p>Define when to use email, chat, or video calls. Clear communication guidelines prevent confusion and ensure everyone stays connected.</p>
        
        <h2>2. Create Dedicated Workspaces</h2>
        <p>A designated work area helps maintain work-life balance and signals to others when you're in "work mode."</p>
        
        <h2>3. Use Time-Blocking Techniques</h2>
        <p>Schedule specific time blocks for different types of work. This helps maintain focus and ensures important tasks don't get overlooked.</p>
        
        <blockquote>
          "The key to remote work success is intentionality—being deliberate about how, when, and where you work."
        </blockquote>
        
        <h2>4. Leverage Collaboration Tools</h2>
        <p>Invest in tools that facilitate seamless collaboration, from project management platforms to shared document systems.</p>
        
        <h2>5. Schedule Regular Check-ins</h2>
        <p>Regular team meetings and one-on-ones maintain connection and ensure everyone is aligned on goals and priorities.</p>
      `,
      heroUrl: null,
      tags: ['Remote Work', 'Productivity', 'Team Management', 'Tips'],
      meta: {
        readingTime: 4,
        wordCount: 280
      }
    }
  ];
  
  const createdArticles = [];
  for (const article of articles) {
    const created = await dbService.articles.create(tenantId, magazineId, issueSlug, article);
    createdArticles.push(created);
  }
  
  return createdArticles;
};

// Create demo ad slots for an issue
export const createDemoAdSlots = async (tenantId, magazineId, issueSlug) => {
  const adSlots = [
    {
      slotKey: 'p4',
      data: {
        creativeUrl: null, // Will be uploaded later
        targetUrl: 'https://example.com/business-software',
        sponsor: 'TechCorp Solutions',
        trackingCode: 'utm_source=magazinify&utm_medium=ad&utm_campaign=p4'
      }
    },
    {
      slotKey: 'p10',
      data: {
        creativeUrl: null,
        targetUrl: 'https://example.com/conference-2025',
        sponsor: 'Tech Conference 2025',
        trackingCode: 'utm_source=magazinify&utm_medium=ad&utm_campaign=p10'
      }
    }
  ];
  
  const createdAdSlots = [];
  for (const { slotKey, data } of adSlots) {
    const created = await dbService.adSlots.create(tenantId, magazineId, issueSlug, slotKey, data);
    createdAdSlots.push(created);
  }
  
  return createdAdSlots;
};

// Generate sample analytics data
export const generateSampleAnalytics = async (tenantId, magazineId, issueSlug, days = 30) => {
  const events = [];
  const eventTypes = ['view', 'page_turn', 'cta_click', 'ad_click'];
  const deviceTypes = ['desktop', 'mobile', 'tablet'];
  
  // Generate random events over the past 30 days
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate 5-50 random events per day
    const eventsPerDay = Math.floor(Math.random() * 45) + 5;
    
    for (let j = 0; j < eventsPerDay; j++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
      
      const analyticsData = {
        tenantId: `/tenants/${tenantId}`,
        magazineId: `/tenants/${tenantId}/magazines/${magazineId}`,
        issueSlug,
        articleId: null,
        event: eventType,
        payload: {
          page: Math.floor(Math.random() * 12) + 1,
          device: deviceType,
          sessionId: uuidv4(),
        },
        createdAt: date,
      };
      
      // Add specific metadata based on event type
      if (eventType === 'ad_click') {
        analyticsData.payload.adSlot = Math.random() > 0.5 ? 'p4' : 'p10';
      } else if (eventType === 'cta_click') {
        analyticsData.payload.ctaType = Math.random() > 0.5 ? 'signup' : 'contact';
      }
      
      events.push(analyticsData);
    }
  }
  
  // Create analytics events in batches
  const createdEvents = [];
  for (const event of events) {
    try {
      const created = await dbService.analytics.create(event);
      createdEvents.push(created);
    } catch (error) {
      console.error('Error creating analytics event:', error);
    }
  }
  
  return createdEvents;
};

// Create a demo user with tenant access
export const createDemoUser = async (tenantId) => {
  const userData = {
    email: 'demo@magazinify.ai',
    displayName: 'Demo User',
    tenants: [
      {
        tenantRef: `/tenants/${tenantId}`,
        role: 'owner'
      }
    ]
  };
  
  // Note: This would typically be called after Firebase Auth user creation
  // For demo purposes, we'll use a fixed UID
  const demoUid = 'demo-user-uid';
  
  return await dbService.users.create(demoUid, userData);
};

export default {
  initializeDatabase,
  createDemoTenant,
  createDemoMagazine,
  createDemoBlueprint,
  createDemoIssue,
  createDemoArticles,
  createDemoAdSlots,
  generateSampleAnalytics,
  createDemoUser,
};
