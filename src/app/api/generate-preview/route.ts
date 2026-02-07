import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Build a prompt for generating an amigurumi preview image
 */
function buildImagePrompt(data: {
  breed: string;
  colors: { primary: string; secondary?: string; tertiary?: string; accent?: string };
  earShape: string;
  tailType: string;
  bodyProportions: { buildType: string };
  distinctiveFeatures?: Array<{ name: string; description: string }>;
  bodyPartAnalysis?: Array<{ partName: string; primaryColor: string; shape: string; texture: string; crochetNotes: string }>;
}): string {
  const colorDesc = [
    `primary color ${data.colors.primary}`,
    data.colors.secondary ? `secondary color ${data.colors.secondary}` : '',
    data.colors.tertiary ? `tertiary color ${data.colors.tertiary}` : '',
  ].filter(Boolean).join(', ');

  const features = (data.distinctiveFeatures || [])
    .slice(0, 3)
    .map(f => f.description)
    .join('; ');

  const partDetails = (data.bodyPartAnalysis || [])
    .slice(0, 5)
    .map(bp => `${bp.partName}: ${bp.shape}, ${bp.texture}, color ${bp.primaryColor}`)
    .join('; ');

  const breedName = data.breed.replace(/-/g, ' ');

  return `Generate a high-quality product photo of a cute handmade crochet amigurumi stuffed toy dog. The toy should look like a ${breedName} dog breed.

Key visual requirements:
- Amigurumi style: round, cute proportions with a slightly oversized head
- Made from yarn with visible crochet texture (tiny V-shaped stitches)
- Colors: ${colorDesc}
- Ears: ${data.earShape} style
- Tail: ${data.tailType} style
- Build: ${data.bodyProportions.buildType}
${features ? `- Distinctive features: ${features}` : ''}
${partDetails ? `- Body part details: ${partDetails}` : ''}

Style: Professional product photography on a clean white/light background. The amigurumi should be sitting upright, facing slightly to the side. Soft, warm lighting. The toy should look handcrafted, adorable, and high quality — like something you'd find on Etsy or in a craft shop. Include small safety eyes (black bead eyes) and an embroidered nose.

Do NOT include any text, watermarks, or logos in the image.`;
}

/**
 * Image generation models to try, in order of preference
 */
const IMAGE_MODELS = [
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.5-flash-image',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { breed, colors, earShape, tailType, bodyProportions, distinctiveFeatures, bodyPartAnalysis } = body;

    if (!breed) {
      return NextResponse.json(
        { error: 'Missing breed information' },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const prompt = buildImagePrompt({
      breed,
      colors: colors || { primary: '#8B4513' },
      earShape: earShape || 'floppy',
      tailType: tailType || 'straight',
      bodyProportions: bodyProportions || { buildType: 'athletic' },
      distinctiveFeatures,
      bodyPartAnalysis,
    });

    // Try each Gemini image generation model in order
    for (const model of IMAGE_MODELS) {
      console.log(`[Preview] Trying model: ${model}`);
      const result = await tryGeminiImageGen(prompt, model, GEMINI_API_KEY);
      if (result) {
        return NextResponse.json(result);
      }
    }

    // Fallback: try Imagen 4 Fast
    console.log('[Preview] Trying Imagen 4 Fast fallback');
    const imagenResult = await tryImagen(prompt, GEMINI_API_KEY);
    if (imagenResult) {
      return NextResponse.json(imagenResult);
    }

    return NextResponse.json(
      { error: 'Image generation not available. All models failed.' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Preview generation failed' },
      { status: 500 }
    );
  }
}

/**
 * Try generating an image using a Gemini model with generateContent + IMAGE modality
 */
async function tryGeminiImageGen(
  prompt: string,
  model: string,
  apiKey: string
): Promise<{ imageBase64: string; mimeType: string } | null> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Preview] ${model} error (${response.status}):`, errorText.slice(0, 200));
      return null;
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        console.log(`[Preview] ${model} generated image successfully`);
        return {
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
        };
      }
    }

    console.warn(`[Preview] ${model} responded but no image in output`);
    return null;
  } catch (error) {
    console.error(`[Preview] ${model} exception:`, error);
    return null;
  }
}

/**
 * Fallback: Try using Imagen 4 Fast for image generation
 */
async function tryImagen(
  prompt: string,
  apiKey: string
): Promise<{ imageBase64: string; mimeType: string } | null> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:generateImages?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1',
            personGeneration: 'dont_allow',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Preview] Imagen 4 error (${response.status}):`, errorText.slice(0, 200));
      return null;
    }

    const data = await response.json();
    const imageData = data.predictions?.[0]?.bytesBase64Encoded;

    if (imageData) {
      console.log('[Preview] Imagen 4 Fast generated image successfully');
      return {
        imageBase64: imageData,
        mimeType: 'image/png',
      };
    }

    return null;
  } catch (error) {
    console.error('[Preview] Imagen 4 exception:', error);
    return null;
  }
}
