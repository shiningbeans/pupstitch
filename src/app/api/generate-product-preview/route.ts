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
 * Build the detailed product preview prompt — v2
 * KEY CHANGE: The face IS the flap. Not a face on a flap. The flap itself IS the dog face.
 */
function buildProductPreviewPrompt(data: PreviewRequestData, photoCount: number): string {
  const earStyleDesc = data.earStyle === 'pointy'
    ? 'pointed fabric ears that stand upright, sewn to the top-left and top-right corners of the pouch'
    : data.earStyle === 'rose'
    ? 'folded rose-shaped fabric ears that curve outward at the sides near the top'
    : data.earStyle === 'button'
    ? 'folded button ears that sit neatly at the top corners, drooping slightly'
    : 'floppy fabric ears that drape outward and downward from the top corners of the pouch';

  const earSizeDesc = EAR_SIZE_DESCRIPTIONS[data.earSize] || EAR_SIZE_DESCRIPTIONS['medium'];
  const materialDesc = MATERIAL_DESCRIPTIONS[data.material] || MATERIAL_DESCRIPTIONS['canvas'];

  const hasPhotos = photoCount > 0;
  const photoContext = hasPhotos
    ? `\n\nREFERENCE PHOTO${photoCount > 1 ? 'S' : ''}: I've attached ${photoCount} photo${photoCount > 1 ? 's' : ''} of the actual ${data.breedName}. Use ${photoCount > 1 ? 'these' : 'this'} ONLY for facial structure and marking placement — NOT for colors. Colors are specified below.`
    : '';

  const colorBlock = `
COLOR SPECIFICATION (follow exactly):
- BODY/FLAP FABRIC: ${data.primaryColor}
- EARS OUTER / MARKINGS: ${data.secondaryColor}
${data.earInnerColor ? `- EAR INNER: ${data.earInnerColor}` : ''}
- MUZZLE APPLIQUE: ${data.muzzleColor || 'light beige or cream'}
- NOSE: ${data.noseColor || 'black'}
- ACCENT (paw prints): ${data.accentColor || 'slightly darker than body'}
${data.regionColors && Object.keys(data.regionColors).length > 0 ? Object.entries(data.regionColors).map(([region, colors]) => `- ${region.toUpperCase()} extra colors: ${colors.join(', ')}`).join('\n') : ''}
Do NOT override these colors. Do NOT default body to white.`;

  return `Generate a photorealistic product photo of a small dog-themed POOP BAG DISPENSER POUCH called "LeashBuddy".${photoContext}
${colorBlock}

=== WHAT THIS PRODUCT IS ===
A compact rectangular fabric pouch (about the size of a deck of cards) that clips to a dog leash. It dispenses poop bags from the bottom and has a treat compartment on top. The front is designed to look like a cute ${data.breedName} face using FLAT machine embroidery and fabric applique — NOT a stuffed animal, NOT a plush toy.

=== CRITICAL STRUCTURE (read carefully) ===

The pouch has exactly TWO sections stacked vertically:

TOP HALF = THE FACE (this is also the flap/lid):
- The ENTIRE top half of the front IS the dog's face
- This top section hinges open (it IS the flap) — but in this photo it is CLOSED, sitting flush
- There is NO separate blank flap sitting on top of the face
- There is NO face underneath a flap
- THE FLAP IS THE FACE. THE FACE IS THE FLAP. They are one and the same piece.
- A small silver snap button at the bottom edge of this face-flap secures it closed

BOTTOM HALF = THE BODY:
- Plain fabric in the body color with two small embroidered paw prints
- This is the poop bag compartment
- A rubber grommet hole at the very bottom center where bags pull through

=== FACE DESIGN (embroidered on the flap surface) ===

The face is flat machine embroidery in a cute kawaii/vector style — like a dog face emoji rendered in thread:

- EYES: Two solid black embroidered circles (~7mm) with tiny white highlight dots. Flat satin stitch, NOT plastic, NOT 3D, NOT safety eyes.
- MUZZLE: A flat ${data.muzzleColor || 'cream'} fabric applique in a rounded U-shape on the lower portion. Completely flush with surface.
- NOSE: Small solid ${data.noseColor || 'black'} embroidered triangle/heart shape centered above the muzzle.
- MOUTH: A tiny embroidered SMILE — upward-curving "U" shape below the nose. Must curve UP (happy expression).
- BREED MARKINGS: ${data.breedName}-appropriate flat color patches in ${data.secondaryColor} (e.g., eye patches for beagles, face mask for huskies).

Style: clean, bold, minimal — like a cute app icon or emoji made with embroidery thread. Everything is FLAT against the fabric.

=== COMPLETE FRONT VIEW (top to bottom) ===

1. FABRIC TAB + CLIP (very top): A 3.5cm fabric loop with a silver spring-gate carabiner clip.

2. EARS (top corners): ${earStyleDesc}. Size: ${earSizeDesc}. Double-layer: outer in ${data.secondaryColor}, inner in ${data.earInnerColor || 'lighter shade'}. Sewn into top corner seams, extending to the sides.

3. FACE-FLAP (upper ~5cm): THE DOG FACE. Eyes, muzzle, nose, mouth, and breed markings are embroidered/appliqued directly on this surface. The face fills this entire section. Silver snap button at bottom edge. When closed (as shown), it sits perfectly flush with the body below — barely visible seam.

4. BODY (lower ~4.5cm): Plain ${data.primaryColor} ${materialDesc} with two small embroidered paw prints in ${data.accentColor || 'darker tone'}. This section holds the poop bag roll.

5. TINY PAW TABS (very bottom): Two very small (~1cm) charcoal grey felt paw-shaped tabs peeking below the bottom edge. Subtle and minimal.

6. RUBBER GROMMET (bottom center): A round rubber-rimmed hole where poop bags feed out from inside.

=== BACK VIEW (not shown but affects silhouette) ===
- Clean flat back in ${data.primaryColor}
- HORIZONTAL ZIPPER across the lower section for loading poop bag rolls — wraps slightly to sides
- The zipper is ONLY on the back. NO zipper visible from the front.
- Two fabric belt loops for threading onto a strap
- Small tonal embroidered dog silhouette logo

=== MATERIALS ===
- Main fabric: ${materialDesc} in ${data.primaryColor}
${data.flapColor ? `- Face flap: ${data.flapColor}` : '- Face flap: same as body'}
- Hardware: brushed silver (carabiner, snap button)
- Zipper: dark #5 nylon coil (BACK ONLY)
- Edge binding: subtle tonal trim, slightly darker than body — NOT bright, NOT contrasting
${data.liningColor ? `- Interior: ${data.liningColor}` : ''}

=== PHOTOGRAPHY ===
- Pure white background, professional studio lighting
- 3/4 front view showing face and one side edge
- Sharp focus, premium e-commerce style (Kickstarter / high-end pet brand aesthetic)
- The product looks premium, compact, well-crafted, and giftable
${data.dogName ? `- This is a custom LeashBuddy made for "${data.dogName}"` : ''}

=== SIZE ===
- Height: ${data.dimensions.heightCm}cm, Width: ${data.dimensions.widthCm}cm, Depth: ${data.dimensions.depthCm}cm
- About the size of a deck of cards or small smartphone

=== DO NOT ===
- Do NOT put a blank/plain flap on top of the face — the face IS the flap
- Do NOT make it look like a stuffed animal or plush toy
- Do NOT use plastic/3D/safety eyes — eyes are flat embroidered circles
- Do NOT show any zipper on the front
- Do NOT add text, watermarks, or human hands
- Do NOT use bright colors for edge binding (must be tonal/subtle)
- Do NOT introduce colors not in the color specification (no random red/blue/green/pink)
- Do NOT make ears oversized — they are small practical fabric pieces`;
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
