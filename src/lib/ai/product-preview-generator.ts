import { DogAnalysisResult } from '@/types';
import { LeashBuddyProductSpec } from '@/types/product-types';

/**
 * Generate a 3D nanobannana-style product preview image for a LeashBuddy
 * @param spec - The LeashBuddy product spec
 * @param analysis - The original dog analysis (for additional breed details)
 * @returns Promise resolving to a base64 data URL of the preview image, or null if generation fails
 */
export async function generateProductPreviewImage(
  spec: LeashBuddyProductSpec,
  analysis: DogAnalysisResult
): Promise<string | null> {
  try {
    // Build embroidery description from specs
    const faceSpec = spec.embroiderySpecs.find(s => s.location === 'front-flap');
    const embroideryDescription = faceSpec
      ? `${faceSpec.designDescription}. Thread colors: ${faceSpec.threadColors.map(t => t.name).join(', ')}`
      : undefined;

    // Get primary colors from fabric spec
    const mainBody = spec.fabricColors.find(f => f.part === 'main-body');
    const earOuter = spec.fabricColors.find(f => f.part === 'ear-outer-left');
    const binding = spec.fabricColors.find(f => f.part === 'binding-edge');

    const response = await fetch('/api/generate-product-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        breedName: spec.breedName,
        earStyle: spec.earStyle,
        primaryColor: mainBody?.colorName || analysis.colors.primary,
        secondaryColor: earOuter?.colorName || analysis.colors.secondary || analysis.colors.primary,
        accentColor: binding?.colorName || analysis.colors.accent || analysis.colors.secondary || '#8B7355',
        productSize: spec.productSize,
        dimensions: spec.dimensions,
        embroideryDescription,
        dogName: spec.dogName,
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
