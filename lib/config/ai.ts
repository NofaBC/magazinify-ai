import OpenAI from 'openai';

// Server-side only — lazy init to prevent build-time errors
let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// Backwards compat
export const openai = { get instance() { return getOpenAI(); } };

/** Default model for content generation */
export const AI_MODEL = 'gpt-4o';

/** Default model for image generation */
export const IMAGE_MODEL = 'dall-e-3';

/** Max tokens per article generation call */
export const MAX_ARTICLE_TOKENS = 2000;