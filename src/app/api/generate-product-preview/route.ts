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
  // Map ear style to a constrained description
  const earDesc = data.earStyle === 'pointy'
    ? 'small pointed fabric ears that extend slightly above the top edge'
    : data.earStyle === 'rose'
    ? 'small folded rose-shaped fabric ears on the sides near the top'
    : data.earStyle === 'button'
    ? 'small folded button ears on the sides near the top'
    : 'small floppy fabric ears that drape slightly to the sides near the top';

  return `Generate a high-quality product photo of a small dog-themed poop bag dispenser pouch called "LeashBuddy", customized to look like a ${data.breedName}.

CRITICAL SHAPE AND PROPORTIONS — follow exactly:
- The product is a COMPACT RECTANGULAR POUCH, approximately ${data.dimensions.heightCm}cm tall × ${data.dimensions.widthCm}cm wide × ${data.dimensions.depthCm}cm deep
- It is sized to hold a standard poop bag roll (3.5cm diameter) in the bottom compartment
- The overall silhouette is a clean, contained rectangle — NO parts (ears, paws, tail) extend far beyond the main body frame
- Think of it as a small fabric pouch about the size of a playing card deck, with subtle dog character features

STRUCTURE (top to bottom):
1. TOP: A fabric loop/tab at the top center with a silver spring-hook carabiner clip for attaching to a leash
2. UPPER HALF — FACE FLAP: A hinged flap that opens via a snap button. The flap has an embroidered cute ${data.breedName} face: two small round black bead eyes, a small embroidered nose and mouth/smile. The face is simple, stylized, and kawaii-cute
3. EARS: ${earDesc}. The ears are small, subtle, and decorative — they do NOT extend more than 1-2cm beyond the body
4. FRONT BODY (below the flap): Two small embroidered paw prints side by side
5. LOWER HALF — BAG COMPARTMENT: A zippered compartment on the bottom/back that holds a poop bag roll, with a small round rubber grommet hole at the very bottom for dispensing bags. Dark gray poop bags hang slightly out of the bottom hole
6. BACK: Clean back panel with a small embossed dog silhouette logo, two vertical belt-loop slots for attaching to a belt or strap, and the zipper for the bag compartment running across the back

MATERIALS AND COLORS:
- Main body fabric: Durable woven canvas/nylon in ${data.primaryColor}
- Ears and accent patches: ${data.secondaryColor}
- Edge binding/trim: ${data.accentColor}
- All edges have neat binding/piping for a clean finished look
- Hardware: Silver-tone carabiner, snap button, and zipper pull
${data.embroideryDescription ? `- Embroidery: ${data.embroideryDescription}` : ''}

STYLE AND CAMERA:
- Clean product photography style, studio-lit on a pure white background
- Shot at a slight 3/4 angle showing the front face and one side
- Photorealistic, like a professional e-commerce/Kickstarter product shot
- The product should look premium, compact, well-made, and giftable
- Cute but functional — this is a real accessory, not a plush toy
- The ${data.breedName} likeness comes from the COLOR PALETTE and embroidered face, not from the shape being dog-shaped
${data.dogName ? `- Custom product for a dog named "${data.dogName}"` : ''}

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
