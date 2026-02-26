import { DogAnalysisResult } from '@/types';
import { LeashBuddyProductSpec, LeashBuddyCustomizations } from '@/types/product-types';

/**
 * Generate a product preview image for a LeashBuddy
 * Now sends the dog photo as a reference image alongside the text prompt
 * @param spec - The LeashBuddy product spec
 * @param analysis - The original dog analysis (for additional breed details)
 * @param dogPhotoBase64 - Optional base64 data URL of the original dog photo
 * @param customizations - Optional user customization overrides
 * @returns Promise resolving to a base64 data URL of the preview image, or null if generation fails
 */
export async function generateProductPreviewImage(
  spec: LeashBuddyProductSpec,
  analysis: DogAnalysisResult,
  dogPhotoBase64?: string | null,
  customizations?: Partial<LeashBuddyCustomizations> | null
): Promise<string | null> {
  try {
    // Build embroidery description from specs
    const faceSpec = spec.embroiderySpecs.find(s => s.location === 'front-flap');
    const embroideryDescription = faceSpec
      ? `${faceSpec.designDescription}. Thread colors: ${faceSpec.threadColors.map(t => t.name).join(', ')}`
      : undefined;

    // Get primary colors from fabric spec (or customization overrides)
    const mainBody = spec.fabricColors.find(f => f.part === 'main-body');
    const earOuter = spec.fabricColors.find(f => f.part === 'ear-outer-left');
    const earInner = spec.fabricColors.find(f => f.part === 'ear-inner-left');
    const binding = spec.fabricColors.find(f => f.part === 'binding-edge');
    const flap = spec.fabricColors.find(f => f.part === 'front-flap');
    const lining = spec.fabricColors.find(f => f.part === 'interior-lining');

    // Prepare the dog photo for the API if available
    let dogPhotoData: string | undefined;
    let dogPhotoMimeType: string | undefined;
    if (dogPhotoBase64 && dogPhotoBase64.startsWith('data:')) {
      const match = dogPhotoBase64.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (match) {
        dogPhotoMimeType = match[1];
        dogPhotoData = match[2];
      }
    }

    const response = await fetch('/api/generate-product-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
        // Send dog photo as reference
        dogPhoto: dogPhotoData,
        dogPhotoMimeType,
      }),
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
