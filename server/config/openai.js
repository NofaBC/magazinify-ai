/**
 * OpenAI API Configuration
 * 
 * This file sets up the OpenAI client for generating magazine content.
 */

const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate magazine content based on website data
 * 
 * @param {Object} websiteData - Data extracted from the website
 * @param {Object} brandInfo - Brand information and tone preferences
 * @param {Object} options - Additional options like article count
 * @returns {Promise<Array>} - Array of generated articles
 */
async function generateMagazineContent(websiteData, brandInfo, options = {}) {
  try {
    const {
      articleCount = 5, // Default to 5 articles (1 flagship + 4 supporting)
      maxTokens = 1500,  // Default max tokens per article
    } = options;
    
    // Prepare system prompt for the flagship article
    const flagshipSystemPrompt = `
      You are an expert content writer for ${brandInfo.businessName || 'a business'}.
      You're creating the flagship article for their monthly magazine.
      Use a tone that is ${brandInfo.tone || 'professional and engaging'}.
      Focus on their primary offerings and include a strong call to action.
      Write in a magazine-friendly format with a captivating headline, subheadings, and sections.
      Include placeholders for images with image descriptions in [IMAGE: description] format.
    `;
    
    // Generate flagship article
    const flagshipResponse = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        { role: "system", content: flagshipSystemPrompt },
        { 
          role: "user", 
          content: `Create a flagship article (1000-1500 words) for ${brandInfo.businessName || 'this business'} 
                  based on this website data:\n\n${JSON.stringify(websiteData, null, 2)}`
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });
    
    const flagshipArticle = {
      type: 'flagship',
      content: flagshipResponse.choices[0].message.content,
      wordCount: flagshipResponse.choices[0].message.content.split(' ').length
    };
    
    // Prepare system prompt for supporting articles
    const supportingSystemPrompt = `
      You are an expert content writer for ${brandInfo.businessName || 'a business'}.
      You're creating a supporting article for their monthly magazine.
      Use a tone that is ${brandInfo.tone || 'professional and engaging'}.
      Write in a magazine-friendly format with a captivating headline, subheadings, and sections.
      Include placeholders for images with image descriptions in [IMAGE: description] format.
      Each article should have a different focus but relate to the business's offerings.
    `;
    
    // Generate supporting articles
    const supportingArticles = [];
    
    for (let i = 0; i < articleCount - 1; i++) {
      // Define the focus for each supporting article
      let focusPrompt;
      
      switch (i) {
        case 0:
          focusPrompt = "Focus on customer success stories or testimonials.";
          break;
        case 1:
          focusPrompt = "Focus on industry trends or news relevant to this business.";
          break;
        case 2:
          focusPrompt = "Focus on how-to or tips related to this business's products/services.";
          break;
        case 3:
          focusPrompt = "Focus on behind-the-scenes or meet-the-team content.";
          break;
        default:
          focusPrompt = "Focus on a different aspect of this business's offerings.";
      }
      
      const supportingResponse = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          { role: "system", content: supportingSystemPrompt },
          { 
            role: "user", 
            content: `Create a supporting article (500-800 words) for ${brandInfo.businessName || 'this business'} 
                    based on this website data:\n\n${JSON.stringify(websiteData, null, 2)}\n\n${focusPrompt}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      supportingArticles.push({
        type: 'supporting',
        content: supportingResponse.choices[0].message.content,
        wordCount: supportingResponse.choices[0].message.content.split(' ').length
      });
    }
    
    // Combine flagship and supporting articles
    return [flagshipArticle, ...supportingArticles];
  } catch (error) {
    console.error('Error generating magazine content:', error);
    throw new Error('Failed to generate magazine content');
  }
}

/**
 * Generate image prompts for articles
 * 
 * @param {Array} articles - Array of generated articles
 * @param {Object} brandInfo - Brand information
 * @returns {Promise<Array>} - Array of image prompts
 */
async function generateImagePrompts(articles, brandInfo) {
  try {
    // Extract image descriptions from articles
    const imagePrompts = [];
    
    articles.forEach(article => {
      const imageRegex = /\[IMAGE: (.*?)\]/g;
      let match;
      
      while ((match = imageRegex.exec(article.content)) !== null) {
        imagePrompts.push({
          description: match[1],
          articleType: article.type,
          prompt: `Create an image of ${match[1]} in the style of ${brandInfo.imageStyle || 'professional and clean'}`
        });
      }
    });
    
    return imagePrompts;
  } catch (error) {
    console.error('Error generating image prompts:', error);
    throw new Error('Failed to generate image prompts');
  }
}

module.exports = {
  openai,
  generateMagazineContent,
  generateImagePrompts
};
