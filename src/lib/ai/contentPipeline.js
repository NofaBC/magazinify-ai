import { openaiService } from './openai.js';
import { dbService } from '../database/firebase.js';

// AI Content Pipeline for Magazine Generation
export class ContentPipeline {
  constructor() {
    this.openai = openaiService;
  }

  /**
   * Generate a complete magazine issue draft
   */
  async generateIssueDraft({ tenantSlug, magazineSlug, issueSlug, blueprint, tenant, magazine }) {
    try {
      console.log(`Starting AI content generation for ${tenantSlug}/${magazineSlug}/${issueSlug}`);
      
      // Step 1: Discover topics based on niche and sources
      const topics = await this.discoverTopics(blueprint.niche, blueprint.sources);
      
      // Step 2: Create outline based on topics, pages, and sections
      const outline = await this.createOutline({
        topics,
        pages: blueprint.structure.pages,
        sections: blueprint.structure.sections,
        voice: blueprint.voice,
        niche: blueprint.niche
      });
      
      // Step 3: Generate articles for each section
      const articles = [];
      for (let i = 0; i < outline.sections.length; i++) {
        const section = outline.sections[i];
        if (section.type !== 'ads' && section.type !== 'cover') {
          const article = await this.writeArticle({
            section,
            voice: blueprint.voice,
            niche: blueprint.niche,
            position: i + 1
          });
          
          // Step 4: Select or generate images for the article
          const images = await this.selectImages({ section, article });
          article.heroUrl = images.heroUrl;
          
          articles.push(article);
        }
      }
      
      // Step 5: Create issue data structure
      const issueData = {
        title: outline.title,
        slug: issueSlug,
        status: 'ready',
        coverUrl: null, // Will be generated later
        pdfUrl: null,
        publishedAt: null,
        meta: {
          outline: outline,
          generatedAt: new Date().toISOString(),
          aiModel: 'gpt-4',
          totalSections: outline.sections.length,
          totalArticles: articles.length
        }
      };
      
      return {
        issue: issueData,
        articles,
        outline
      };
      
    } catch (error) {
      console.error('Error in AI content generation:', error);
      throw new Error(`AI content generation failed: ${error.message}`);
    }
  }

  /**
   * Discover relevant topics based on niche and sources
   */
  async discoverTopics(niche, sources) {
    try {
      // For MVP, we'll use a combination of predefined topics and AI-generated ones
      const baseTopics = niche.topics || [];
      const keywords = niche.keywords || [];
      const geo = niche.geo || [];
      
      // Create a prompt for topic discovery
      const prompt = `
        Generate 5-8 relevant magazine article topics for a publication focused on:
        
        Primary Topics: ${baseTopics.join(', ')}
        Keywords: ${keywords.join(', ')}
        Geographic Focus: ${geo.join(', ')}
        
        The topics should be:
        - Current and relevant to the target audience
        - Engaging and informative
        - Suitable for a professional magazine format
        - Diverse in scope while staying within the niche
        
        Return the topics as a JSON array of strings.
      `;
      
      const response = await this.openai.generateContent(prompt, {
        maxTokens: 500,
        temperature: 0.7
      });
      
      let discoveredTopics = [];
      try {
        discoveredTopics = JSON.parse(response);
      } catch (parseError) {
        // Fallback: extract topics from response text
        discoveredTopics = response.split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, ''))
          .slice(0, 8);
      }
      
      // Combine with base topics and remove duplicates
      const allTopics = [...new Set([...baseTopics, ...discoveredTopics])];
      
      return {
        discovered: discoveredTopics,
        combined: allTopics,
        sources: sources.rss || [],
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error discovering topics:', error);
      // Fallback to base topics if AI fails
      return {
        discovered: [],
        combined: niche.topics || ['Business', 'Technology', 'Innovation'],
        sources: sources.rss || [],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create a magazine outline based on topics and structure
   */
  async createOutline({ topics, pages, sections, voice, niche }) {
    try {
      const currentDate = new Date();
      const monthYear = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;
      
      const prompt = `
        Create a detailed magazine outline for a ${pages}-page publication titled "${monthYear} Issue".
        
        Available Topics: ${topics.combined.join(', ')}
        Required Sections: ${sections.join(', ')}
        Voice/Tone: ${voice.tone}
        Reading Level: ${voice.readingLevel}
        Target Audience: ${niche.topics.join(', ')} enthusiasts
        
        For each section, provide:
        - Section type (from the required sections)
        - Title/headline
        - Brief description (1-2 sentences)
        - Estimated page count
        - Key points to cover
        
        Ensure the total pages don't exceed ${pages} and include engaging, relevant content.
        
        Return as JSON with this structure:
        {
          "title": "Magazine Title",
          "sections": [
            {
              "type": "section_type",
              "title": "Section Title",
              "description": "Brief description",
              "pages": 2,
              "keyPoints": ["point1", "point2"]
            }
          ]
        }
      `;
      
      const response = await this.openai.generateContent(prompt, {
        maxTokens: 1000,
        temperature: 0.6
      });
      
      let outline;
      try {
        outline = JSON.parse(response);
      } catch (parseError) {
        // Fallback outline if parsing fails
        outline = this.createFallbackOutline(sections, topics.combined, monthYear, pages);
      }
      
      // Validate and adjust outline
      outline = this.validateOutline(outline, sections, pages);
      
      return outline;
      
    } catch (error) {
      console.error('Error creating outline:', error);
      // Return fallback outline
      return this.createFallbackOutline(sections, topics.combined || ['Business', 'Technology'], 
        `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`, pages);
    }
  }

  /**
   * Write an individual article based on section and voice
   */
  async writeArticle({ section, voice, niche, position }) {
    try {
      const prompt = `
        Write a magazine article for the "${section.title}" section.
        
        Section Details:
        - Type: ${section.type}
        - Description: ${section.description}
        - Key Points: ${section.keyPoints?.join(', ') || 'N/A'}
        
        Writing Guidelines:
        - Tone: ${voice.tone}
        - Reading Level: ${voice.readingLevel}
        - Target Audience: ${niche.topics?.join(', ') || 'General business'} professionals
        - Length: 300-600 words
        
        The article should:
        - Have an engaging headline
        - Include a compelling lead paragraph
        - Use subheadings for better readability
        - Include actionable insights or takeaways
        - Be informative and professionally written
        
        Return as JSON:
        {
          "title": "Article Title",
          "slug": "article-slug",
          "html": "<article>Full HTML content with proper formatting</article>",
          "summary": "Brief 1-2 sentence summary",
          "tags": ["tag1", "tag2", "tag3"],
          "readingTime": 4,
          "wordCount": 450
        }
      `;
      
      const response = await this.openai.generateContent(prompt, {
        maxTokens: 1500,
        temperature: 0.7
      });
      
      let article;
      try {
        article = JSON.parse(response);
      } catch (parseError) {
        // Fallback article creation
        article = this.createFallbackArticle(section, position);
      }
      
      // Ensure required fields
      article.position = position;
      article.slug = article.slug || this.generateSlug(article.title);
      article.createdAt = new Date().toISOString();
      
      return article;
      
    } catch (error) {
      console.error('Error writing article:', error);
      return this.createFallbackArticle(section, position);
    }
  }

  /**
   * Select or generate images for articles
   */
  async selectImages({ section, article }) {
    try {
      // For MVP, we'll use placeholder images
      // In production, this would integrate with image generation or stock photo APIs
      
      const imagePrompt = `${section.title} - ${article.title}`;
      const heroUrl = `https://picsum.photos/800/600?random=${Date.now()}`;
      
      // TODO: Integrate with actual image generation service
      // const generatedImage = await this.openai.generateImage(imagePrompt);
      
      return {
        heroUrl,
        additionalImages: [],
        prompt: imagePrompt,
        source: 'placeholder'
      };
      
    } catch (error) {
      console.error('Error selecting images:', error);
      return {
        heroUrl: `https://picsum.photos/800/600?random=${Math.random()}`,
        additionalImages: [],
        prompt: 'fallback',
        source: 'placeholder'
      };
    }
  }

  /**
   * Regenerate a specific article with optional prompt override
   */
  async regenerateArticle({ article, promptOverride, voice, niche }) {
    try {
      const basePrompt = `
        Rewrite the following article with improvements:
        
        Original Title: ${article.title}
        Original Content: ${article.html}
        
        ${promptOverride ? `Special Instructions: ${promptOverride}` : ''}
        
        Writing Guidelines:
        - Tone: ${voice.tone}
        - Reading Level: ${voice.readingLevel}
        - Keep the same general topic but improve clarity, engagement, and value
        - Length: 300-600 words
      `;
      
      const response = await this.openai.generateContent(basePrompt, {
        maxTokens: 1500,
        temperature: 0.8
      });
      
      let updatedArticle;
      try {
        updatedArticle = JSON.parse(response);
      } catch (parseError) {
        // If parsing fails, create updated version manually
        updatedArticle = {
          ...article,
          html: response,
          title: article.title + ' (Updated)',
          updatedAt: new Date().toISOString()
        };
      }
      
      return {
        ...article,
        ...updatedArticle,
        updatedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error regenerating article:', error);
      throw new Error(`Failed to regenerate article: ${error.message}`);
    }
  }

  // Helper methods
  createFallbackOutline(sections, topics, title, pages) {
    const sectionMap = {
      cover: { pages: 1, description: 'Magazine cover with title and featured story' },
      toc: { pages: 1, description: 'Table of contents and editorial note' },
      feature: { pages: 3, description: 'Main feature article' },
      spotlight: { pages: 2, description: 'Spotlight on industry trends' },
      news: { pages: 1, description: 'Industry news and updates' },
      tips: { pages: 2, description: 'Practical tips and insights' },
      ads: { pages: 1, description: 'Advertisement placement' },
      closing: { pages: 1, description: 'Closing thoughts and next issue preview' }
    };
    
    const outlineSections = sections.map((sectionType, index) => ({
      type: sectionType,
      title: this.getSectionTitle(sectionType, topics[index % topics.length]),
      description: sectionMap[sectionType]?.description || 'Content section',
      pages: sectionMap[sectionType]?.pages || 1,
      keyPoints: [`Key insight about ${topics[index % topics.length]}`, 'Actionable takeaways']
    }));
    
    return {
      title,
      sections: outlineSections,
      totalPages: outlineSections.reduce((sum, s) => sum + s.pages, 0)
    };
  }

  createFallbackArticle(section, position) {
    const title = section.title || `${section.type.charAt(0).toUpperCase() + section.type.slice(1)} Article`;
    
    return {
      position,
      title,
      slug: this.generateSlug(title),
      html: `
        <article>
          <h1>${title}</h1>
          <p class="lead">This is a placeholder article for the ${section.type} section.</p>
          <h2>Key Insights</h2>
          <p>${section.description || 'Content will be generated based on your blueprint configuration.'}</p>
          <h2>Takeaways</h2>
          <ul>
            ${section.keyPoints?.map(point => `<li>${point}</li>`).join('') || '<li>Important insight</li><li>Actionable advice</li>'}
          </ul>
        </article>
      `,
      summary: section.description || 'Article summary',
      tags: [section.type, 'business', 'insights'],
      readingTime: 3,
      wordCount: 250,
      createdAt: new Date().toISOString()
    };
  }

  getSectionTitle(sectionType, topic) {
    const titleMap = {
      cover: `${topic} Magazine`,
      toc: 'In This Issue',
      feature: `The Future of ${topic}`,
      spotlight: `Spotlight: ${topic} Trends`,
      news: `${topic} News & Updates`,
      tips: `${topic} Tips & Best Practices`,
      ads: 'Advertisement',
      closing: 'Looking Ahead'
    };
    
    return titleMap[sectionType] || `${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} Section`;
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  validateOutline(outline, requiredSections, maxPages) {
    // Ensure all required sections are present
    const presentSections = outline.sections.map(s => s.type);
    const missingSections = requiredSections.filter(s => !presentSections.includes(s));
    
    // Add missing sections
    missingSections.forEach(sectionType => {
      outline.sections.push({
        type: sectionType,
        title: this.getSectionTitle(sectionType, 'Business'),
        description: `${sectionType} section`,
        pages: 1,
        keyPoints: ['Key insight', 'Important takeaway']
      });
    });
    
    // Adjust pages if over limit
    const totalPages = outline.sections.reduce((sum, s) => sum + s.pages, 0);
    if (totalPages > maxPages) {
      const ratio = maxPages / totalPages;
      outline.sections.forEach(section => {
        section.pages = Math.max(1, Math.floor(section.pages * ratio));
      });
    }
    
    return outline;
  }
}

// Export singleton instance
export const contentPipeline = new ContentPipeline();

export default contentPipeline;
