seedPublishedIssue.ts// Seed script to create a published issue for testing
// This would normally use Firebase Admin SDK in a real application

import { dbService } from '../src/lib/database/firebase.js';

async function seedPublishedIssue() {
  try {
    console.log('🌱 Starting seed process...');

    const tenantSlug = 'visionwing';
    const magazineSlug = 'showcase';
    const issueSlug = '2025-09';

    // Create tenant
    console.log('Creating tenant...');
    const tenantData = {
      name: 'VisionWing',
      slug: tenantSlug,
      email: 'owner@visionwing.com',
      plan: 'pro',
      billingStatus: 'active',
      featureFlags: {
        hasCustomDomain: true,
        customDomain: 'mag.visionwing.ai',
        maxPages: 12,
        maxMagazines: 2,
        premiumTemplates: true,
        richMedia: true
      }
    };

    await dbService.tenants.create(tenantSlug, tenantData);
    console.log('✅ Tenant created');

    // Create magazine
    console.log('Creating magazine...');
    const magazineData = {
      title: 'VisionWing Showcase',
      slug: magazineSlug,
      description: 'Monthly highlights and industry insights',
      theme: {
        fontHead: 'Playfair Display',
        fontBody: 'Inter',
        primary: '#1e293b',
        accent: '#38bdf8'
      }
    };

    await dbService.magazines.create(tenantSlug, magazineSlug, magazineData);
    console.log('✅ Magazine created');

    // Create blueprint
    console.log('Creating blueprint...');
    const blueprintData = {
      structure: {
        pages: 12,
        sections: ['cover', 'toc', 'feature', 'spotlight', 'news', 'tips', 'ads', 'closing'],
        adSlots: ['p4', 'p10']
      },
      voice: {
        tone: 'professional',
        readingLevel: '8-10'
      },
      niche: {
        topics: ['Technology', 'Business', 'Innovation'],
        geo: ['Global'],
        keywords: ['AI', 'SaaS', 'Digital Transformation']
      },
      sources: {
        rss: [],
        uploadsAllowed: true
      },
      cadence: 'monthly',
      approvalMode: 'semi_auto'
    };

    await dbService.blueprints.create(tenantSlug, magazineSlug, blueprintData);
    console.log('✅ Blueprint created');

    // Create published issue
    console.log('Creating published issue...');
    const issueData = {
      title: 'September 2025 - Innovation Spotlight',
      slug: issueSlug,
      status: 'published',
      coverUrl: 'https://picsum.photos/seed/mag2025/1200/1600',
      pdfUrl: '',
      publishedAt: new Date(),
      sprites: [
        {
          page: 1,
          url: 'https://picsum.photos/seed/page1/800/1200',
          width: 800,
          height: 1200
        },
        {
          page: 2,
          url: 'https://picsum.photos/seed/page2/800/1200',
          width: 800,
          height: 1200
        },
        {
          page: 3,
          url: 'https://picsum.photos/seed/page3/800/1200',
          width: 800,
          height: 1200
        },
        {
          page: 4,
          url: 'https://picsum.photos/seed/page4/800/1200',
          width: 800,
          height: 1200
        }
      ],
      meta: {
        totalPages: 4,
        totalArticles: 3,
        generatedAt: new Date().toISOString(),
        aiModel: 'gpt-4'
      }
    };

    await dbService.issues.create(tenantSlug, magazineSlug, issueSlug, issueData);
    console.log('✅ Published issue created');

    // Create sample articles
    console.log('Creating sample articles...');
    
    const articles = [
      {
        position: 1,
        slug: 'welcome-innovation',
        title: 'Welcome to the Innovation Spotlight',
        html: `
          <article>
            <h1>Welcome to the Innovation Spotlight</h1>
            <p class="lead">This month, we explore the cutting-edge technologies and business strategies that are reshaping industries worldwide.</p>
            
            <h2>What's Inside This Issue</h2>
            <p>From artificial intelligence breakthroughs to sustainable business practices, our September issue covers the most impactful innovations of 2025.</p>
            
            <h2>Key Highlights</h2>
            <ul>
              <li>AI-powered business transformation strategies</li>
              <li>Sustainable technology solutions</li>
              <li>Future of remote work and collaboration</li>
              <li>Emerging market opportunities</li>
            </ul>
            
            <p>We hope you find these insights valuable for your business journey. Thank you for being part of our community.</p>
          </article>
        `,
        heroUrl: 'https://picsum.photos/seed/hero1/1200/800',
        tags: ['welcome', 'innovation', 'business'],
        summary: 'Welcome to our September issue focusing on innovation and business transformation.',
        readingTime: 3,
        wordCount: 180
      },
      {
        position: 2,
        slug: 'ai-business-transformation',
        title: 'AI-Powered Business Transformation: A Complete Guide',
        html: `
          <article>
            <h1>AI-Powered Business Transformation: A Complete Guide</h1>
            <p class="lead">Artificial intelligence is no longer a futuristic concept—it's a present reality that's transforming how businesses operate, compete, and grow.</p>
            
            <h2>The Current State of AI in Business</h2>
            <p>Today's businesses are leveraging AI across multiple functions, from customer service chatbots to predictive analytics and automated decision-making systems.</p>
            
            <h2>Key Areas of AI Implementation</h2>
            <h3>Customer Experience</h3>
            <p>AI-powered personalization engines are helping businesses deliver tailored experiences at scale, increasing customer satisfaction and loyalty.</p>
            
            <h3>Operations Optimization</h3>
            <p>Machine learning algorithms are optimizing supply chains, reducing costs, and improving efficiency across various business processes.</p>
            
            <h3>Data-Driven Decision Making</h3>
            <p>Advanced analytics and AI models are enabling businesses to make more informed decisions based on real-time data insights.</p>
            
            <h2>Getting Started with AI Transformation</h2>
            <ol>
              <li>Assess your current technology infrastructure</li>
              <li>Identify high-impact use cases for AI implementation</li>
              <li>Develop a phased implementation strategy</li>
              <li>Invest in team training and development</li>
              <li>Establish metrics for measuring AI ROI</li>
            </ol>
            
            <p>The key to successful AI transformation is starting small, learning fast, and scaling what works.</p>
          </article>
        `,
        heroUrl: 'https://picsum.photos/seed/hero2/1200/800',
        tags: ['AI', 'business transformation', 'technology'],
        summary: 'A comprehensive guide to implementing AI-powered business transformation strategies.',
        readingTime: 8,
        wordCount: 420
      },
      {
        position: 3,
        slug: 'future-remote-work',
        title: 'The Future of Remote Work: Trends and Technologies',
        html: `
          <article>
            <h1>The Future of Remote Work: Trends and Technologies</h1>
            <p class="lead">Remote work has evolved from a temporary pandemic solution to a permanent fixture in the modern workplace. Here's what the future holds.</p>
            
            <h2>Hybrid Work Models</h2>
            <p>The most successful organizations are adopting flexible hybrid models that combine the benefits of remote work with in-person collaboration.</p>
            
            <h2>Technology Enablers</h2>
            <h3>Virtual Reality Meetings</h3>
            <p>VR technology is making remote meetings more immersive and engaging, bridging the gap between physical and digital collaboration.</p>
            
            <h3>AI-Powered Productivity Tools</h3>
            <p>Intelligent assistants and automation tools are helping remote workers stay productive and focused on high-value tasks.</p>
            
            <h3>Advanced Communication Platforms</h3>
            <p>Next-generation communication tools are enabling seamless collaboration across time zones and cultures.</p>
            
            <h2>Challenges and Solutions</h2>
            <p>While remote work offers many benefits, organizations must address challenges like maintaining company culture, ensuring cybersecurity, and preventing employee burnout.</p>
            
            <h2>Best Practices for Remote Teams</h2>
            <ul>
              <li>Establish clear communication protocols</li>
              <li>Invest in the right technology stack</li>
              <li>Focus on outcomes rather than hours worked</li>
              <li>Create virtual social interaction opportunities</li>
              <li>Provide mental health and wellness support</li>
            </ul>
            
            <p>The future of work is flexible, technology-enabled, and focused on results rather than location.</p>
          </article>
        `,
        heroUrl: 'https://picsum.photos/seed/hero3/1200/800',
        tags: ['remote work', 'future of work', 'technology'],
        summary: 'Exploring the trends and technologies shaping the future of remote work.',
        readingTime: 6,
        wordCount: 320
      }
    ];

    for (const article of articles) {
      await dbService.articles.create(tenantSlug, magazineSlug, issueSlug, article);
    }
    console.log('✅ Sample articles created');

    // Create sample ad slots
    console.log('Creating sample ad slots...');
    
    const adSlots = [
      {
        slotKey: 'p4',
        creativeUrl: 'https://picsum.photos/seed/ad1/800/600',
        targetUrl: 'https://example.com/product1',
        sponsor: 'TechCorp Solutions',
        trackingCode: 'tc_001'
      },
      {
        slotKey: 'p10',
        creativeUrl: 'https://picsum.photos/seed/ad2/800/600',
        targetUrl: 'https://example.com/product2',
        sponsor: 'Innovation Labs',
        trackingCode: 'il_002'
      }
    ];

    for (const adSlot of adSlots) {
      await dbService.adSlots.create(tenantSlug, magazineSlug, issueSlug, adSlot.slotKey, adSlot);
    }
    console.log('✅ Sample ad slots created');

    // Create another issue for archive testing
    console.log('Creating second issue for archive...');
    const issueSlug2 = '2025-08';
    const issueData2 = {
      title: 'August 2025 - Summer Tech Trends',
      slug: issueSlug2,
      status: 'published',
      coverUrl: 'https://picsum.photos/seed/mag2025aug/1200/1600',
      pdfUrl: '',
      publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      sprites: [
        {
          page: 1,
          url: 'https://picsum.photos/seed/aug1/800/1200',
          width: 800,
          height: 1200
        },
        {
          page: 2,
          url: 'https://picsum.photos/seed/aug2/800/1200',
          width: 800,
          height: 1200
        }
      ],
      meta: {
        totalPages: 2,
        totalArticles: 1,
        generatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        aiModel: 'gpt-4'
      }
    };

    await dbService.issues.create(tenantSlug, magazineSlug, issueSlug2, issueData2);
    console.log('✅ Second issue created');

    console.log('\n🎉 Seed process completed successfully!');
    console.log('\nCreated:');
    console.log(`- Tenant: ${tenantSlug}`);
    console.log(`- Magazine: ${magazineSlug}`);
    console.log(`- Issues: ${issueSlug}, ${issueSlug2}`);
    console.log(`- Articles: ${articles.length} in ${issueSlug}`);
    console.log(`- Ad Slots: ${adSlots.length} in ${issueSlug}`);
    console.log('\nYou can now test the application with this seeded data.');
    console.log(`Visit: /${tenantSlug}/issues/${issueSlug}`);

  } catch (error) {
    console.error('❌ Seed process failed:', error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPublishedIssue()
    .then(() => {
      console.log('✅ Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}

export { seedPublishedIssue };
