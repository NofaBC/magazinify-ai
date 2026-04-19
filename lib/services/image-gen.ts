import { getOpenAI, IMAGE_MODEL } from '@/lib/config/ai';
import { logger } from '@/lib/utils/logger';

/** Generate an image using DALL-E for a magazine article */
export async function generateArticleImage(
  prompt: string
): Promise<string | null> {
  try {
    const response = await getOpenAI().images.generate({
      model: IMAGE_MODEL,
      prompt: `Professional magazine editorial photo: ${prompt}. Clean, high-quality, modern editorial style.`,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    return response.data?.[0]?.url ?? null;
  } catch (err) {
    logger.error('Image generation failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/** Generate a cover image for a magazine issue */
export async function generateCoverImage(
  businessName: string,
  yearMonth: string
): Promise<string | null> {
  const [year, month] = yearMonth.split('-');
  const monthName = new Date(Number(year), Number(month) - 1).toLocaleString(
    'en-US',
    { month: 'long' }
  );

  return generateArticleImage(
    `Modern, elegant magazine cover design for "${businessName}" publication, ${monthName} ${year} edition. Minimalist, professional, clean typography.`
  );
}