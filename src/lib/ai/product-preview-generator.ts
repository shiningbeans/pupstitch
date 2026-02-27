import { DogAnalysisResult } from '@/types';
import { LeashBuddyProductSpec, LeashBuddyCustomizations } from '@/types/product-types';

/**
 * Build the common request body for product preview generation
 */
function buildRequestBody(
  spec: LeashBuddyProductSpec,
  analysis: DogAnalysisResult,
  dogPhotoBase64?: string | null,
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

  let dogPhotoData: string | undefined;
  let dogPhotoMimeType: string | undefined;
  if (dogPhotoBase64 && dogPhotoBase64.startsWith('data:')) {
    const match = dogPhotoBase64.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (match) {
      dogPhotoMimeType = match[1];
      dogPhotoData = match[2];
    }
  }

  return {
    breedName: spec.breedName,
    earStyle: customizations?.earStyle || spec.earStyle,
    earSize: customizations?.earSize || 'medium',
    primaryColor: customizations?.bodyColor || mainBody?.colorName || analysis.colors.primary,
    secondaryColor: customizations?.earColor || earOuter?.colorName || analysis.colors.secondary || analysis.colors.primary,
    earInnerColor: customizations?.earInnerColor || earInner?.colorName,
    accentColor: customizations?.bindingColor || binding?.colorName || analysis.colors.accent || analysis.colors.secondary || '#8B7355',
    flapColor: customizations?.flapColor || flap?.colorName,
    liningColor: customizations?.liningColor || lining?.colorName,
    material: customizations?.material || 'canvas',
    productSize: spec.productSize,
    dimensions: spec.dimensions,
    embroideryDescription,
    dogName: spec.dogName,
    dogPhoto: dogPhotoData,
    dogPhotoMimeType,
    ...(count ? { count } : {}),
  };
}

/**
 * Generate a single product preview image (backward compatible)
 */
export async function generateProductPreviewImage(
  spec: LeashBuddyProductSpec,
  analysis: DogAnalysisResult,
  dogPhotoBase64?: string | null,
  customizations?: Partial<LeashBuddyCustomizations> | null
): Promise<string | null> {
  try {
    const body = buildRequestBody(spec, analysis, dogPhotoBase64, customizations);

    const response = await fetch('/api/generate-product-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

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
    console.warn('Product preview generation error:', error);
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
  dogPhotoBase64?: string | null,
  customizations?: Partial<LeashBuddyCustomizations> | null
): Promise<string[]> {
  try {
    const body = buildRequestBody(spec, analysis, dogPhotoBase64, customizations, 2);

    const response = await fetch('/api/generate-product-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

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
    console.warn('Product preview options generation error:', error);
    return [];
  }
}
