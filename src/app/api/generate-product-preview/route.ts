import { NextRequest, NextResponse } from 'next/server';

// Allow up to 120 seconds for image generation on Vercel
export const maxDuration = 120;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Material descriptions for the prompt
 */
const MATERIAL_DESCRIPTIONS: Record<string, string> = {
  'canvas': 'durable woven cotton canvas with a slightly textured matte finish',
  'cordura': 'smooth, tightly-woven Cordura nylon with a slight sheen',
  'leather': 'premium full-grain leather with natural grain texture',
  'faux-leather': 'smooth PU vegan leather with a uniform finish',
  'neoprene': 'soft flexible neoprene with a smooth, slightly rubbery surface',
};

/**
 * Ear size descriptions for the prompt
 */
const EAR_SIZE_DESCRIPTIONS: Record<string, string> = {
  'small': 'very small and subtle, extending less than 0.5cm beyond the body edge',
  'medium': 'compact, extending about 0.5-1.5cm beyond the body edge',
  'large': 'moderately sized, extending about 1.5-2cm beyond the body edge',
};

interface PreviewRequestData {
  breedName: string;
  earStyle: string;
  earSize: string;
  primaryColor: string;
  secondaryColor: string;
  earInnerColor?: string;
  muzzleColor?: string;
  noseColor?: string;
  accentColor: string;
  flapColor?: string;
  liningColor?: string;
  material: string;
  productSize: string;
  dimensions: { heightCm: number; widthCm: number; depthCm: number };
  embroideryDescription?: string;
  dogName?: string;
  dogPhoto?: string;
  dogPhotoMimeType?: string;
  dogPhotos?: Array<{ data: string; mimeType: string }>;
  count?: number;
  regionColors?: Record<string, string[]>;
}

/**
 * Build the product preview prompt — v3
 * Strategy: SHORT prompt, critical rules FIRST, 3/4 back-angle to show zipper + grommet
 */
function buildProductPreviewPrompt(data: PreviewRequestData, photoCount: number): string {
  const earStyleDesc = data.earStyle === 'pointy' ? 'pointed upright'
    : data.earStyle === 'rose' ? 'folded rose-shaped'
    : data.earStyle === 'button' ? 'folded button'
    : 'floppy drooping';

  const earSizeDesc = EAR_SIZE_DESCRIPTIONS[data.earSize] || EAR_SIZE_DESCRIPTIONS['medium'];
  const materialDesc = MATERIAL_DESCRIPTIONS[data.material] || MATERIAL_DESCRIPTIONS['canvas'];

  const hasPhotos = photoCount > 0;
  const photoRef = hasPhotos
    ? `The attached photo${photoCount > 1 ? 's show' : ' shows'} the real ${data.breedName}. Use ONLY for face structure and marking placement — NOT for colors.`
    : '';

  const regionColorLines = data.regionColors && Object.keys(data.regionColors).length > 0
    ? '\n' + Object.entries(data.regionColors).map(([region, colors]) => `${region}: also has ${colors.join(', ')}`).join('\n')
    : '';

  return `Photorealistic product photo of a small fabric dog poop bag dispenser pouch shaped like a cute ${data.breedName} face.
${photoRef}

MANDATORY RULES (violating any = failure):
1. THE TOP FLAP *IS* THE DOG FACE — eyes, nose, mouth are embroidered directly on the flap. There is NO separate plain flap over the face. The flap and face are ONE piece.
2. A dark horizontal ZIPPER must be visible on the back/side of the lower section (for loading poop bag rolls).
3. A round RUBBER GROMMET HOLE at the bottom center where poop bags pull out.
4. ONLY use these exact colors — NO other colors anywhere on the product:
   Body: ${data.primaryColor}
   Ears/markings: ${data.secondaryColor}${data.earInnerColor ? `\n   Ear inner: ${data.earInnerColor}` : ''}
   Muzzle patch: ${data.muzzleColor || 'cream'}
   Nose: ${data.noseColor || 'black'}
   Paw prints: ${data.accentColor || 'darker shade of body'}
   Eyes: black embroidery with white dot
   Hardware: brushed silver only
   Edge binding: same shade as body (tonal, NOT contrasting)${regionColorLines}
   NOTHING ELSE. No red, blue, green, orange, pink, or any accent color not listed above.
5. Face embroidery is FLAT (flush with fabric) — like a cute emoji/vector icon in thread. NOT 3D, NOT plastic eyes, NOT a stuffed animal.

PRODUCT DESCRIPTION:
A compact rectangular ${materialDesc} pouch, ${data.dimensions.heightCm}cm tall × ${data.dimensions.widthCm}cm wide × ${data.dimensions.depthCm}cm deep (size of a deck of cards). It clips to a dog leash via a silver carabiner on a fabric tab at the top.

STRUCTURE (top to bottom):
- Silver carabiner clip on a short fabric tab
- Two small ${earStyleDesc} fabric ears at top corners (${earSizeDesc}), outer: ${data.secondaryColor}${data.earInnerColor ? `, inner: ${data.earInnerColor}` : ''}
- TOP HALF (the flap) = cute ${data.breedName} FACE in flat embroidery: two black circle eyes with white highlights, ${data.muzzleColor || 'cream'} muzzle applique, ${data.noseColor || 'black'} nose, tiny smile mouth, breed-appropriate markings in ${data.secondaryColor}. Secured by silver snap button at bottom edge.
- BOTTOM HALF = plain ${data.primaryColor} body with two small embroidered paw prints in ${data.accentColor || 'darker tone'}. Contains poop bag roll.
- Two tiny charcoal felt paw tabs at very bottom edge
- RUBBER GROMMET HOLE at bottom center (round, for dispensing bags)

BACK:
- Dark horizontal zipper across lower half (wraps slightly to sides)
- Two fabric belt loops
- Small tonal dog silhouette logo

CAMERA: 3/4 angle from the BACK-SIDE so we can see BOTH the cute face at an angle AND the back zipper + bottom grommet. Pure white background, professional studio lighting, sharp focus, premium e-commerce aesthetic.${data.dogName ? `\nCustom product for a dog named "${data.dogName}".` : ''}

DO NOT: add any colors not listed above, make it look like a plush toy, use 3D/plastic eyes, add text or watermarks, show human hands, make ears oversized.`;
}

/**
 * Generate one image using a single model (no fallback chain for speed).
 */
async function generateOneImage(
  contentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>,
  apiKey: string,
): Promise<{ imageBase64: string; mimeType: string } | null> {
  // Use the fastest reliable model only — no fallback chain
  const model = 'gemini-2.0-flash-exp-image-generation';
  console.log(`[ProductPreview] Generating with ${model}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000); // 90s hard timeout

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: contentParts }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ProductPreview] ${model} error (${response.status}):`, errorText.slice(0, 300));

      // If primary model fails, try one fallback
      console.log('[ProductPreview] Trying gemini-2.5-flash-image fallback');
      return await tryGeminiImageGen(contentParts, 'gemini-2.5-flash-image', apiKey);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        console.log(`[ProductPreview] Image generated successfully`);
        return {
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
        };
      }
    }

    console.warn(`[ProductPreview] ${model} responded but no image — trying fallback`);
    return await tryGeminiImageGen(contentParts, 'gemini-2.5-flash-image', apiKey);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[ProductPreview] Generation timed out after 90s');
    } else {
      console.error(`[ProductPreview] ${model} exception:`, error);
    }
    // One fallback attempt
    console.log('[ProductPreview] Trying gemini-2.5-flash-image fallback after error');
    return await tryGeminiImageGen(contentParts, 'gemini-2.5-flash-image', apiKey);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequestData = await request.json();
    const {
      breedName,
      dogPhoto,
      dogPhotoMimeType,
      dogPhotos,
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

    // Apply defaults
    body.earStyle = body.earStyle || 'floppy';
    body.earSize = body.earSize || 'medium';
    body.primaryColor = body.primaryColor || '#D4A574';
    body.secondaryColor = body.secondaryColor || '#C4956A';
    body.accentColor = body.accentColor || '#8B7355';
    body.material = body.material || 'canvas';
    body.productSize = body.productSize || 'medium';
    body.dimensions = body.dimensions || { heightCm: 9.5, widthCm: 6.5, depthCm: 5.5 };
    body.breedName = body.breedName.replace(/-/g, ' ');

    // Build content parts — photos first, then text prompt
    const contentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
    let photoCount = 0;

    if (dogPhotos && dogPhotos.length > 0) {
      for (const photo of dogPhotos) {
        if (photo.data && photo.mimeType) {
          contentParts.push({
            inlineData: { mimeType: photo.mimeType, data: photo.data },
          });
          photoCount++;
        }
      }
    } else if (dogPhoto && dogPhotoMimeType) {
      contentParts.push({
        inlineData: { mimeType: dogPhotoMimeType, data: dogPhoto },
      });
      photoCount = 1;
    }

    const prompt = buildProductPreviewPrompt(body, photoCount);
    contentParts.push({ text: prompt });

    // Always generate 1 image for speed (user can regenerate if they want another)
    console.log(`[ProductPreview] Generating 1 preview (${photoCount} reference photos)`);
    const result = await generateOneImage(contentParts, GEMINI_API_KEY);

    if (result) {
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Image generation failed. Please try again.' },
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
 * Try generating an image using a specific Gemini model (used as fallback)
 */
async function tryGeminiImageGen(
  contentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>,
  model: string,
  apiKey: string
): Promise<{ imageBase64: string; mimeType: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: contentParts }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ProductPreview] ${model} error (${response.status}):`, errorText.slice(0, 300));
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
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`[ProductPreview] ${model} timed out`);
    } else {
      console.error(`[ProductPreview] ${model} exception:`, error);
    }
    return null;
  }
}
