import { DogAnalysisResult } from '@/types';

/**
 * Generate an amigurumi preview image using AI
 * @param analysis - The dog analysis result to base the image on
 * @returns Promise resolving to a base64 data URL of the preview image, or null if generation fails
 */
export async function generatePreviewImage(
  analysis: DogAnalysisResult
): Promise<string | null> {
  try {
    const response = await fetch('/api/generate-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        breed: analysis.detectedBreed,
        colors: analysis.colors,
        earShape: analysis.earShape,
        tailType: analysis.tailType,
        bodyProportions: analysis.bodyProportions,
        distinctiveFeatures: analysis.distinctiveFeatures,
        bodyPartAnalysis: analysis.bodyPartAnalysis,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Preview generation failed:', errorData.error || response.status);
      return null;
    }

    const data = await response.json();

    if (data.imageBase64 && data.mimeType) {
      return `data:${data.mimeType};base64,${data.imageBase64}`;
    }

    return null;
  } catch (error) {
    console.warn('Preview generation error:', error);
    return null;
  }
}
