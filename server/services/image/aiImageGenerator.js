/**
 * AI Image Generator Service
 * 
 * This service generates images for magazines using the OpenAI DALL-E API.
 */

const { openai } = require('../../config/openai');
const axios = require('axios');
const { storage } = require('../../config/firebase');
const { nanoid } = require('nanoid');
const sharp = require('sharp');
const logger = require('../../utils/logger');

/**
 * Generate an image using DALL-E based on a prompt
 * 
 * @param {string} prompt - The image generation prompt
 * @param {Object} options - Additional options like size and style
 * @returns {Promise<Object>} - The generated image data
 */
async function generateImage(prompt, options = {}) {
  try {
    const {
      size = '1024x1024',
      style = 'natural',
      quality = 'standard',
      model = process.env.OPENAI_IMAGE_MODEL || 'dall-e-3'
    } = options;
    
    logger.info(`Generating AI image with prompt: ${prompt}`);
    
    // Generate image using OpenAI DALL-E
    const response = await openai.images.generate({
      model,
      prompt,
      n: 1,
      size,
      quality,
      style,
      response_format: 'url'
    });
    
    // Get image URL from response
    const imageUrl = response.data[0].url;
    
    // Download the image
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data);
    
    // Optimize image with sharp
    const optimizedImageBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 85, progressive: true })
      .resize(1024, null, { fit: 'inside' })
      .toBuffer();
    
    // Generate a unique filename
    const filename = `ai-generated-${nanoid(8)}.jpg`;
    
    // Upload to Cloud Storage
    const imageRef = storage.bucket().file(`temp/ai-images/${filename}`);
    
    await imageRef.save(optimizedImageBuffer, {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          source: 'ai',
          prompt,
          generatedAt: new Date().toISOString()
        }
      }
    });
    
    await imageRef.makePublic();
    
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${storage.bucket().name}/temp/ai-images/${filename}`;
    
    return {
      url: publicUrl,
      prompt,
      width: 1024,
      height: 1024, // This is approximate and will depend on the actual image
      source: 'ai'
    };
  } catch (error) {
    logger.error(`Error generating AI image: ${error.message}`);
    
    // If OpenAI API fails, try a fallback image generator
    if (process.env.USE_FALLBACK_IMAGE_GENERATOR === 'true') {
      return generateImageFallback(prompt, options);
    }
    
    throw new Error(`Failed to generate AI image: ${error.message}`);
  }
}

/**
 * Fallback image generator using a different API
 * 
 * @param {string} prompt - The image generation prompt
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The generated image data
 */
async function generateImageFallback(prompt, options = {}) {
  try {
    logger.info(`Using fallback image generator with prompt: ${prompt}`);
    
    // You would implement a different image generation API here
    // This is a placeholder for a potential fallback service
    
    // For now, we'll return a placeholder image
    const placeholderUrl = 'https://via.placeholder.com/1024x1024.jpg?text=AI+Image+Generation+Unavailable';
    
    return {
      url: placeholderUrl,
      prompt,
      width: 1024,
      height: 1024,
      source: 'fallback'
    };
  } catch (error) {
    logger.error(`Error with fallback image generator: ${error.message}`);
    throw new Error('Failed to generate image with fallback generator');
  }
}

/**
 * Check if prompt is safe for image generation
 * 
 * @param {string} prompt - The image generation prompt
 * @returns {Promise<boolean>} - Whether the prompt is safe
 */
async function isSafePrompt(prompt) {
  try {
    // Use OpenAI to check if the prompt is safe for image generation
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a prompt safety checker. Review the following image generation prompt and determine if it's safe to use for an AI image generator.
                   Return JSON with a single field "safe": true or false.
                   Unsafe content includes: violence, gore, nudity, sexual content, hate speech, illegal activities, personal information, etc.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    return result.safe;
  } catch (error) {
    logger.error(`Error checking prompt safety: ${error.message}`);
    // In case of error, default to safe to avoid blocking legitimate requests
    return true;
  }
}

module.exports = {
  generateImage,
  isSafePrompt
};
