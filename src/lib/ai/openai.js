import OpenAI from 'openai';
import { config } from '../config.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  dangerouslyAllowBrowser: true, // Note: In production, API calls should go through your backend
});

export const aiService = {
  // Generate magazine topics based on blueprint and content sources
  async generateTopics(blueprint, contentSources = [], count = 5) {
    const prompt = `
Generate ${count} engaging magazine article topics for a publication with the following characteristics:

Brand Voice: ${blueprint.voice?.tone || 'professional'} and ${blueprint.voice?.style || 'informative'}
Target Keywords: ${blueprint.voice?.keywords?.join(', ') || 'general interest'}
Content Sources: ${contentSources.length > 0 ? contentSources.join(', ') : 'general topics'}

Requirements:
- Topics should be current, relevant, and engaging
- Match the brand voice and style
- Be suitable for a ${blueprint.defaultPageCount || 8}-page magazine format
- Include a mix of feature articles, news, and insights

Return as a JSON array of objects with: title, description, category, estimatedPages
`;

    try {
      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.openai.maxTokens,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating topics:', error);
      throw new Error('Failed to generate topics');
    }
  },

  // Generate article outline
  async generateOutline(topic, blueprint, pageCount = 2) {
    const prompt = `
Create a detailed article outline for the following topic:
Title: ${topic.title}
Description: ${topic.description}

Magazine Details:
- Brand Voice: ${blueprint.voice?.tone || 'professional'} and ${blueprint.voice?.style || 'informative'}
- Target Pages: ${pageCount}
- Style: Magazine article format

Requirements:
- Create an engaging headline and subtitle
- Develop ${pageCount * 2} main sections/points
- Include 2-3 pull quotes or key insights
- Suggest image/visual opportunities
- Maintain the specified brand voice

Return as JSON with: headline, subtitle, sections (array of {title, content, pullQuote?}), visualSuggestions
`;

    try {
      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.openai.maxTokens,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating outline:', error);
      throw new Error('Failed to generate outline');
    }
  },

  // Generate full article content
  async generateArticle(outline, blueprint, wordCount = 800) {
    const prompt = `
Write a complete magazine article based on this outline:

Headline: ${outline.headline}
Subtitle: ${outline.subtitle}
Sections: ${JSON.stringify(outline.sections)}

Requirements:
- Target word count: ${wordCount} words
- Brand voice: ${blueprint.voice?.tone || 'professional'} and ${blueprint.voice?.style || 'informative'}
- Magazine-style formatting with engaging paragraphs
- Include the suggested pull quotes naturally in the text
- Write in a compelling, readable style
- Include a strong opening and conclusion

Return as JSON with: title, subtitle, content (full article text), pullQuotes (array), author, summary (150 words)
`;

    try {
      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.openai.maxTokens,
        temperature: 0.6,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating article:', error);
      throw new Error('Failed to generate article');
    }
  },

  // Generate image prompts for articles
  async generateImagePrompts(article, count = 3) {
    const prompt = `
Generate ${count} detailed image prompts for a magazine article with the following details:

Title: ${article.title}
Summary: ${article.summary}
Content preview: ${article.content.substring(0, 500)}...

Requirements:
- Create professional, magazine-quality image descriptions
- Images should complement the article content
- Include style directions (photography, illustration, etc.)
- Make prompts specific and detailed for AI image generation
- Ensure images are appropriate for print/digital magazine format

Return as JSON array of objects with: prompt, style, placement (header/inline/sidebar), altText
`;

    try {
      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating image prompts:', error);
      throw new Error('Failed to generate image prompts');
    }
  },

  // Generate magazine layout suggestions
  async generateLayout(articles, blueprint, pageCount) {
    const prompt = `
Create a magazine layout plan for ${pageCount} pages with the following articles:

Articles: ${JSON.stringify(articles.map(a => ({ title: a.title, summary: a.summary, estimatedPages: a.estimatedPages || 2 })))}

Blueprint sections: ${JSON.stringify(blueprint.sections)}
Ad slots: ${JSON.stringify(blueprint.adSlots)}

Requirements:
- Distribute articles across ${pageCount} pages
- Include cover page, table of contents, and back cover
- Place ad slots as specified in blueprint
- Balance content distribution
- Consider visual flow and reader engagement

Return as JSON with: pages (array of {pageNumber, type, content, layout})
`;

    try {
      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.openai.maxTokens,
        temperature: 0.5,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating layout:', error);
      throw new Error('Failed to generate layout');
    }
  },

  // Generate content from RSS feeds or external sources
  async processContentSources(sources, blueprint, maxArticles = 5) {
    const prompt = `
Analyze these content sources and suggest ${maxArticles} article ideas that would fit a magazine with this brand profile:

Content Sources: ${sources.join('\n')}
Brand Voice: ${blueprint.voice?.tone || 'professional'} and ${blueprint.voice?.style || 'informative'}
Keywords: ${blueprint.voice?.keywords?.join(', ') || 'general'}

Requirements:
- Extract key trends, news, or insights from the sources
- Adapt content to match the brand voice
- Create original article angles, not just summaries
- Ensure content is magazine-appropriate
- Include source attribution where relevant

Return as JSON array of objects with: title, description, sourceInspiration, category, estimatedPages
`;

    try {
      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.openai.maxTokens,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error processing content sources:', error);
      throw new Error('Failed to process content sources');
    }
  },
};

export default aiService;
