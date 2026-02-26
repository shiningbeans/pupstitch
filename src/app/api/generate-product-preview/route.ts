import { NextRequest, NextResponse } from 'next/server';

// Allow up to 60 seconds for image generation on Vercel
export const maxDuration = 60;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Build a prompt for generating a 3D nanobannana-style LeashBuddy product render
 */
function buildProductPreviewPrompt(data: {
  breedName: string;
  earStyle: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  productSize: string;
  dimensions: { heightCm: number; widthCm: number; depthCm: number };
  embroideryDescription?: string;
  dogName?: string;
}): string {
  const sizeLabel = data.productSize === 'small' ? 'compact' : data.productSize === 'large' ? 'oversized' : 'standard';

  return `Generate a high-quality 3D product render of a cute custom dog-shaped poop bag holder / treat pouch called "LeashBuddy". This product clips to a dog leash and is designed to look like a ${data.breedName}.

Product design specifications:
- Shape: A small pouch (${data.dimensions.heightCm}cm tall × ${data.dimensions.widthCm}cm wide × ${data.dimensions.depthCm}cm deep) shaped like a ${data.breedName}'s face/head
- Material: Durable canvas/nylon fabric with a soft, premium feel
- Primary color: ${data.primaryColor} (main body)
- Secondary color: ${data.secondaryColor} (ears, trim, paw accents)
- Accent color: ${data.accentColor} (binding edges)
- Ears: 3D ${data.earStyle} ears that stick out from the top — double-layered, matching the breed
- Face: Embroidered on the front flap — cute stylized ${data.breedName} face with bead eyes and embroidered nose/mouth
${data.embroideryDescription ? `- Embroidery details: ${data.embroideryDescription}` : ''}
- Hardware: Small silver carabiner clip on top for leash attachment
- Bottom: Zippered compartment with a small round hole for dispensing poop bags
- Back: Two belt-loop D-ring attachments
- Closure: Metal snap button on the front flap

Style requirements:
- 3D product render style — clean, professional, photorealistic
- Soft studio lighting on a clean white/light gradient background
- Product floating or on a minimal surface, shot at a 3/4 angle showing front and one side
- The style should feel like a premium Kickstarter/DTC product render — aspirational, cute, and giftable
- Nanobannana aesthetic: slightly rounded, plush proportions with a kawaii/cute character feel while remaining a functional accessory
- The ${data.breedName} likeness should be immediately recognizable
- Size: ${sizeLabel} (${data.dimensions.heightCm}cm tall)
${data.dogName ? `- This is a custom LeashBuddy for a dog named "${data.dogName}"` : ''}

Do NOT include any text, watermarks, logos, or human hands in the image.`;
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
    const {
      breedName,
      earStyle,
      primaryColor,
      secondaryColor,
      accentColor,
      productSize,
      dimensions,
      embroideryDescription,
      dogName,
    } = body;

    if (!breedName) {
      return NextResponse.json(
        { error: 'Missing breed name' },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const prompt = buildProductPreviewPrompt({
      breedName: breedName.replace(/-/g, ' '),
      earStyle: earStyle || 'floppy',
      primaryColor: primaryColor || '#D4A574',
      secondaryColor: secondaryColor || '#C4956A',
      accentColor: accentColor || '#8B7355',
      productSize: productSize || 'medium',
      dimensions: dimensions || { heightCm: 9.5, widthCm: 6.5, depthCm: 5.5 },
      embroideryDescription,
      dogName,
    });

    // Try each Gemini image generation model in order
    for (const model of IMAGE_MODELS) {
      console.log(`[ProductPreview] Trying model: ${model}`);
      const result = await tryGeminiImageGen(prompt, model, GEMINI_API_KEY);
      if (result) {
        return NextResponse.json(result);
      }
    }

    // Fallback: try Imagen 4 Fast
    console.log('[ProductPreview] Trying Imagen 4 Fast fallback');
    const imagenResult = await tryImagen(prompt, GEMINI_API_KEY);
    if (imagenResult) {
      return NextResponse.json(imagenResult);
    }

    return NextResponse.json(
      { error: 'Product preview generation not available. All models failed.' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Product preview generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Product preview generation failed' },
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
      console.error(`[ProductPreview] ${model} error (${response.status}):`, errorText.slice(0, 200));
      return null;
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        console.log(`[ProductPreview] ${model} generated image successfully`);
        return {
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
        };
      }
    }

    console.warn(`[ProductPreview] ${model} responded but no image in output`);
    return null;
  } catch (error) {
    console.error(`[ProductPreview] ${model} exception:`, error);
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
      console.error(`[ProductPreview] Imagen 4 error (${response.status}):`, errorText.slice(0, 200));
      return null;
    }

    const data = await response.json();
    const imageData = data.predictions?.[0]?.bytesBase64Encoded;

    if (imageData) {
      console.log('[ProductPreview] Imagen 4 Fast generated image successfully');
      return {
        imageBase64: imageData,
        mimeType: 'image/png',
      };
    }

    return null;
  } catch (error) {
    console.error('[ProductPreview] Imagen 4 exception:', error);
    return null;
  }
}
