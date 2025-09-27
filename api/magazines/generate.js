import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';
import OpenAI from 'openai';

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

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get user blueprint
    const blueprintDoc = await db.collection('blueprints').doc(uid).get();
    if (!blueprintDoc.exists) {
      return res.status(404).json({ error: 'User blueprint not found' });
    }

    const blueprint = blueprintDoc.data();
    
    // Generate magazine content using AI
    const magazineContent = await generateMagazineContent(blueprint);
    
    // Create magazine record
    const magazine = {
      id: generateId(),
      userId: uid,
      title: magazineContent.title,
      subtitle: magazineContent.subtitle,
      coverImage: magazineContent.coverImage,
      pages: magazineContent.pages,
      status: 'draft',
      createdAt: new Date().toISOString(),
      publishedAt: null,
      analytics: {
        views: 0,
        clicks: 0,
        shares: 0,
        avgReadTime: 0
      }
    };

    // Save to Firestore
    await db.collection('magazines').doc(magazine.id).set(magazine);

    res.status(201).json({
      message: 'Magazine generated successfully',
      magazine: {
        id: magazine.id,
        title: magazine.title,
        status: magazine.status,
        createdAt: magazine.createdAt
      }
    });

  } catch (error) {
    console.error('Magazine generation error:', error);
    res.status(500).json({ error: 'Failed to generate magazine' });
  }
}

async function generateMagazineContent(blueprint) {
  try {
    // Generate magazine outline
    const outlinePrompt = `
      Create a compelling magazine outline for ${blueprint.businessName} (${blueprint.website}).
      
      Business Context:
      - Industry: ${blueprint.content.goals}
      - Voice: ${blueprint.content.voiceTone}
      - Content Focus: ${blueprint.content.contentFocus}
      
      Create an 8-12 page magazine with:
      1. Catchy title relevant to current month
      2. 6-8 articles with headlines and brief descriptions
      3. Each article should link back to their website naturally
      
      Format as JSON with: title, subtitle, articles array with {headline, description, pageNumber, callToAction}
    `;

    const outlineResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: outlinePrompt }],
      temperature: 0.7,
    });

    const outline = JSON.parse(outlineResponse.choices[0].message.content);

    // Generate full articles
    const pages = [];
    
    for (let i = 0; i < outline.articles.length; i++) {
      const article = outline.articles[i];
      
      const articlePrompt = `
        Write a ${blueprint.content.voiceTone.toLowerCase()} magazine article about "${article.headline}".
        
        Requirements:
        - 300-500 words
        - Include a compelling deck (subtitle)
        - Add 2-3 pull quotes
        - Natural CTA linking to ${blueprint.website}
        - Focus on ${blueprint.content.contentFocus}
        
        Format as JSON: {headline, deck, body, pullQuotes, cta}
      `;

      const articleResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: articlePrompt }],
        temperature: 0.6,
      });

      const fullArticle = JSON.parse(articleResponse.choices[0].message.content);

      // Generate article image
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Professional business magazine image for article about ${article.headline}. Clean, modern, business-appropriate style.`,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      pages.push({
        pageNumber: i + 2, // Start from page 2 (page 1 is cover)
        type: 'article',
        content: {
          ...fullArticle,
          image: imageResponse.data[0].url,
          websiteLink: blueprint.website
        }
      });
    }

    // Generate cover image
    const coverImageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Professional business magazine cover for "${outline.title}" featuring ${blueprint.businessName}. Modern, clean, corporate design.`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    // Add cover page
    pages.unshift({
      pageNumber: 1,
      type: 'cover',
      content: {
        title: outline.title,
        subtitle: outline.subtitle,
        businessName: blueprint.businessName,
        image: coverImageResponse.data[0].url,
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        })
      }
    });

    return {
      title: outline.title,
      subtitle: outline.subtitle,
      coverImage: coverImageResponse.data[0].url,
      pages
    };

  } catch (error) {
    console.error('Content generation error:', error);
    throw new Error('Failed to generate magazine content');
  }
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}
