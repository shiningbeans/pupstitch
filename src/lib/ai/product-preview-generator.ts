import { DogAnalysisResult } from '@/types';
import { LeashBuddyProductSpec, LeashBuddyCustomizations } from '@/types/product-types';

/**
 * Parse a data URL into base64 data + mime type
 */
function parseDataUrl(dataUrl: string): { data: string; mimeType: string } | null {
  const match = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
  if (match) return { mimeType: match[1], data: match[2] };
  return null;
}

/**
 * Build the common request body for product preview generation.
 * Now accepts an array of dog photos for multi-angle reference.
 */
function buildRequestBody(
  spec: LeashBuddyProductSpec,
  analysis: DogAnalysisResult,
  dogPhotos?: string[],
  customizations?: Partial<LeashBuddyCustomizations> | null,
  count?: number,
) {
  const faceSpec = spec.embroiderySpecs.find(s => s.location === 'front-flap');
  const embroideryDescription = faceSpec
    ? `${faceSpec.designDescription}. Thread colors: ${faceSpec.threadColors.map(t => t.name).join(', ')}`
    : undefined;

  const mainBody = spec.fabricColors.find(f => f.part === 'main-body');
  const earOuter = spec.fabricColors.find(f => f.part === 'ear-outer-left');
  const earInner = spec.fabricColors.find(f => f.part === 'ear-inner-left');
  const binding = spec.fabricColors.find(f => f.part === 'binding-edge');
  const flap = spec.fabricColors.find(f => f.part === 'front-flap');
  const lining = spec.fabricColors.find(f => f.part === 'interior-lining');

  // Parse all dog photos into base64 data
  const parsedPhotos: Array<{ data: string; mimeType: string }> = [];
  if (dogPhotos && dogPhotos.length > 0) {
    for (const photoUrl of dogPhotos) {
      const parsed = parseDataUrl(photoUrl);
      if (parsed) parsedPhotos.push(parsed);
    }
  }

  // Build the request body
  const body: Record<string, unknown> = {
    breedName: spec.breedName,
    earStyle: customizations?.earStyle || spec.earStyle,
    earSize: customizations?.earSize || 'medium',
    primaryColor: customizations?.bodyColor || mainBody?.colorName || analysis.colors.primary,
    secondaryColor: customizations?.earColor || earOuter?.colorName || analysis.colors.secondary || analysis.colors.primary,
    earInnerColor: customizations?.earInnerColor || earInner?.colorName,
    accentColor: customizations?.bindingColor || binding?.colorName || analysis.colors.accent || analysis.colors.secondary || '#8B7355',
    flapColor: customizations?.flapColor || flap?.colorName,
    liningColor: customizations?.liningColor || lining?.colorName,
    muzzleColor: customizations?.muzzleColor,
    noseColor: customizations?.noseColor,
    material: customizations?.material || 'canvas',
    productSize: spec.productSize,
    dimensions: spec.dimensions,
    embroideryDescription,
    dogName: spec.dogName,
    regionColors: customizations?.regionColors,
  };

  // Send photos: use dogPhotos array for multiple, fallback to single dogPhoto for compat
  if (parsedPhotos.length > 1) {
    body.dogPhotos = parsedPhotos;
  } else if (parsedPhotos.length === 1) {
    body.dogPhoto = parsedPhotos[0].data;
    body.dogPhotoMimeType = parsedPhotos[0].mimeType;
  }

  if (count) body.count = count;

  return body;
}

/**
 * Generate a single product preview image (backward compatible)
 */
export async function generateProductPreviewImage(
  spec: LeashBuddyProductSpec,
  analysis: DogAnalysisResult,
  dogPhotos?: string[],
  customizations?: Partial<LeashBuddyCustomizations> | null
): Promise<string | null> {
  try {
    const body = buildRequestBody(spec, analysis, dogPhotos, customizations);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000); // 55s client timeout (Vercel free = 60s)

    const response = await fetch('/api/generate-product-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Product preview generation failed:', errorData.error || response.status);
      return null;
    }

    const data = await response.json();

    if (data.imageBase64 && data.mimeType) {
      return `data:${data.mimeType};base64,${data.imageBase64}`;
    }

    return null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Product preview generation timed out after 55s');
    } else {
      console.warn('Product preview generation error:', error);
    }
    return null;
  }
}

/**
 * Generate two product preview options in parallel.
 * Returns an array of base64 data URLs (0-2 items).
 */
export async function generateProductPreviewOptions(
  spec: LeashBuddyProductSpec,
  analysis: DogAnalysisResult,
  dogPhotos?: string[],
  customizations?: Partial<LeashBuddyCustomizations> | null
): Promise<string[]> {
  try {
    const body = buildRequestBody(spec, analysis, dogPhotos, customizations, 2);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000); // 55s client timeout

    const response = await fetch('/api/generate-product-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Product preview options generation failed:', errorData.error || response.status);
      return [];
    }

    const data = await response.json();

    // Multi-image response: { images: [{ imageBase64, mimeType }, ...] }
    if (data.images && Array.isArray(data.images)) {
      return data.images
        .filter((img: { imageBase64?: string; mimeType?: string }) => img.imageBase64 && img.mimeType)
        .map((img: { imageBase64: string; mimeType: string }) => `data:${img.mimeType};base64,${img.imageBase64}`);
    }

    // Fallback: single image response (if API returned old format)
    if (data.imageBase64 && data.mimeType) {
      return [`data:${data.mimeType};base64,${data.imageBase64}`];
    }

    return [];
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Product preview options timed out after 55s');
    } else {
      console.warn('Product preview options generation error:', error);
    }
    return [];
  }
}
