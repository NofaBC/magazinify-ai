import { getOpenAI, IMAGE_MODEL } from '@/lib/config/ai';
import { getAdminDb } from '@/lib/config/firebase-admin';
import { logger } from '@/lib/utils/logger';

/** Download an image from URL and upload to Firebase Storage via Admin SDK, return permanent URL */
async function persistImage(tempUrl: string, path: string): Promise<string> {
  try {
    // Download the image
    const response = await fetch(tempUrl);
    if (!response.ok) throw new Error(`Failed to download: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());

    // Upload to Firebase Storage via Admin SDK
    const { getStorage } = await import('firebase-admin/storage');
    const bucket = getStorage().bucket();
    const file = bucket.file(path);
    await file.save(buffer, {
      metadata: { contentType: 'image/png' },
      public: true,
    });

    // Return permanent public URL
    return `https://storage.googleapis.com/${bucket.name}/${path}`;
  } catch (err) {
    logger.warn('Image persistence failed, using temp URL', {
      error: err instanceof Error ? err.message : String(err),
    });
    return tempUrl; // Fallback to temp URL if persistence fails
  }
}

/** Generate an image using DALL-E and persist to Firebase Storage */
export async function generateArticleImage(
  prompt: string,
  storagePath?: string
): Promise<string | null> {
  try {
    const response = await getOpenAI().images.generate({
      model: IMAGE_MODEL,
      prompt: `Professional magazine editorial photo: ${prompt}. Clean, high-quality, modern editorial style.`,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const tempUrl = response.data?.[0]?.url;
    if (!tempUrl) return null;

    // Persist to Firebase Storage if path provided
    if (storagePath) {
      return persistImage(tempUrl, storagePath);
    }
    return tempUrl;
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
  yearMonth: string,
  tenantId?: string
): Promise<string | null> {
  const [year, month] = yearMonth.split('-');
  const monthName = new Date(Number(year), Number(month) - 1).toLocaleString(
    'en-US',
    { month: 'long' }
  );

  const storagePath = tenantId
    ? `tenants/${tenantId}/issues/${yearMonth}/cover.png`
    : undefined;

  return generateArticleImage(
    `Modern, elegant magazine cover design for "${businessName}" publication, ${monthName} ${year} edition. Minimalist, professional, clean typography.`,
    storagePath
  );
}
