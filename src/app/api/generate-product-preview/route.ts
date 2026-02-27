import { NextRequest, NextResponse } from 'next/server';

// Allow up to 60 seconds for image generation on Vercel
export const maxDuration = 60;

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
  'medium': 'small and compact, extending about 0.5-1cm beyond the body edge',
  'large': 'moderately sized, extending about 1-1.5cm beyond the body edge',
};

interface PreviewRequestData {
  breedName: string;
  earStyle: string;
  earSize: string;
  primaryColor: string;
  secondaryColor: string;
  earInnerColor?: string;
  accentColor: string;
  flapColor?: string;
  liningColor?: string;
  material: string;
  productSize: string;
  dimensions: { heightCm: number; widthCm: number; depthCm: number };
  embroideryDescription?: string;
  dogName?: string;
  dogPhoto?: string;       // single base64 image data (no prefix) — backward compat
  dogPhotoMimeType?: string;
  dogPhotos?: Array<{ data: string; mimeType: string }>;  // multiple photos
  count?: number;          // number of preview variants to generate (1 or 2)
}

/**
 * Build the detailed product preview prompt
 */
function buildProductPreviewPrompt(data: PreviewRequestData, photoCount: number): string {
  // Map ear style to description
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
    ? `\n\nREFERENCE PHOTO${photoCount > 1 ? 'S' : ''}: I've attached ${photoCount} photo${photoCount > 1 ? 's' : ''} of the actual ${data.breedName} dog. Study ${photoCount > 1 ? 'ALL photos carefully from multiple angles' : 'this photo carefully'} — focusing on the dog's COLORING, MARKINGS, and FACIAL STRUCTURE. The embroidered face on the flap should be a cute, flat, graphic depiction of THIS SPECIFIC DOG using the dog's actual coat colors and breed markings.`
    : '';

  const colorSamplingInstructions = hasPhotos
    ? `\n\nCOLOR ACCURACY — THIS IS THE MOST IMPORTANT RULE:
Study the dog photo${photoCount > 1 ? 's' : ''} and estimate the percentage breakdown of colors on the dog's coat/fur ONLY. For example: "60% golden brown, 25% cream, 15% black".
- Use ONLY colors visible on the DOG'S FUR and COAT — completely IGNORE background colors (walls, floors, furniture, grass, human hands, clothing, blankets, or any non-dog element in the photo).
- THE ENTIRE POUCH BODY FABRIC must be dyed/colored to match the dog's DOMINANT coat color. If the dog is black-and-white, the body should be the dominant of those two. If the dog is mostly black with white markings, the body is BLACK. If mostly white with black markings, the body is WHITE. If the dog is brown/golden/tan, the body is that brown/golden/tan.
- NEVER default the body to plain white unless the dog's coat is genuinely predominantly white (over 50% white fur).
- The face flap, lower body, and all fabric surfaces should reflect the dog's actual coloring — not a generic white pouch with colored patches on top.
- Apply the dog's SECONDARY coat colors as the marking patches, ear colors, and accent pieces — proportional to how much of the dog's coat they actually cover.
- The muzzle/snout applique should match the actual color around the dog's mouth and chin area.
- Think of the pouch as being "dressed" in the dog's coat — the fabric IS the dog's fur color, not a blank canvas.`
    : '';

  // When photos are provided, let Gemini determine colors from the photos
  // instead of using potentially incorrect hex values from the analysis step
  const secondaryColorDesc = hasPhotos
    ? 'the dog\'s secondary/marking coat color as seen in the reference photo(s)'
    : `${data.secondaryColor}`;

  return `Generate a photorealistic product photograph of a small dog-themed POOP BAG DISPENSER POUCH called "LeashBuddy", designed to look like a cute ${data.breedName}.${photoContext}${colorSamplingInstructions}

WHAT THIS PRODUCT LOOKS LIKE:
A compact rectangular fabric pouch (about the size of a deck of cards) shaped and decorated to look like a cute ${data.breedName} dog face. From the front, you see a DOG FACE that covers the ENTIRE front surface — eyes, nose, muzzle, and breed markings all embroidered/appliqued directly onto the front panel. Small fabric ears poke out from the top corners. The whole thing clips to a leash via a carabiner at the top.

CRITICAL LAYOUT — THE FACE COVERS THE ENTIRE FRONT:
The dog face embroidery/applique spans the FULL FRONT of the pouch from top to bottom. There is NO separate lid, NO plain panel above or below the face. The eyes sit in the upper third, the muzzle/nose sit in the middle-to-lower area. The face IS the front of the pouch. When viewed from the front, you see ONLY the dog face design — it dominates the entire front surface.

(Construction note: internally, the upper portion of the front is a flap that hinges open for access to a treat compartment, secured by a small snap button hidden at the seam line. But from the OUTSIDE looking at it CLOSED, you cannot see any separation — it looks like one continuous dog face panel.)

EMBROIDERY STYLE:
The face is a clean, flat, VECTOR-ILLUSTRATION style design — like a cute dog face emoji or app icon rendered as machine embroidery. Bold, clean lines. Solid filled areas of color. Everything is FLAT and flush with the fabric surface. NOT 3D, NOT sculptural, NOT a stuffed animal face.

EXACT DIMENSIONS:
- Total height (body only, no tab/clip): ${data.dimensions.heightCm}cm
- Width: ${data.dimensions.widthCm}cm
- Depth: ${data.dimensions.depthCm}cm
- Fabric tab above body: 3.5cm (connects to carabiner)
- For scale: roughly the size of a deck of playing cards

FRONT VIEW DESCRIPTION (what the camera sees):

1. CARABINER + TAB (very top): A small fabric loop tab at the top center with a silver/dark carabiner clip hanging from it.

2. SMALL EARS (top corners): ${earStyleDesc}. The ears are ${earSizeDesc}. Double-layered: outer in ${secondaryColorDesc}, inner in ${data.earInnerColor || 'a lighter shade'}. They sit at the top-left and top-right corners, extending to the SIDES. They are small and practical — decorative but compact.

3. THE DOG FACE (covers the ENTIRE front surface):
   The entire front of the pouch IS the dog face. The fabric body color IS the dog's base coat color. Embroidered and appliqued onto this are:

   - EYES: Two solid BLACK embroidered circles (6-8mm), FLAT satin-stitch, with a tiny white highlight dot in each. Positioned in the upper third of the front. Like cute cartoon eyes — simple, clean, flat.
   - BREED MARKINGS: Flat applique patches in ${secondaryColorDesc} for any distinctive markings (eye patches, face mask, color splits, spots). These are cut fabric pieces sewn flat onto the face area.
   - MUZZLE: A flat fabric applique in light beige/cream, bean-shaped or rounded U-shape, in the lower-center of the front. Takes up roughly the bottom third of the face.
   - NOSE: Small solid BLACK embroidered triangle/heart shape at the top of the muzzle.
   - MOUTH: Tiny embroidered smile line ("w" or curve) below the nose.

   The face design fills edge-to-edge. No blank space above the eyes — the forehead area is filled with the body color and any breed markings.

4. PAW PRINTS (lower front area): Two small flat embroidered paw prints near the bottom of the front, partially overlapping with the lower face/chin area.

5. SMALL PAW TABS (bottom edge): Two very small (1cm) charcoal grey felt tabs peeking out from the bottom edge. Minimal and subtle.

BODY FABRIC COLOR — MOST IMPORTANT:
${hasPhotos ? `IGNORE any hex color values — determine the body color ENTIRELY from the dog reference photo(s). The entire pouch body fabric must be dyed/colored to match the dog's DOMINANT coat color. If the dog is mostly brown, the pouch is brown. If mostly black, the pouch is black. If tricolor, use the most prevalent color. The body color is NOT white/cream unless the dog genuinely is predominantly white.` : `The body fabric is ${materialDesc} in ${data.primaryColor}.`}

The fabric body color should match the dog's primary/dominant coat color so the face markings sit naturally on top — like the pouch IS the dog's face, with the fabric being the "skin/fur" base.

BACK AND SIDES:
- Clean back panel with a small embroidered dog silhouette logo
- Horizontal zipper on the BACK only (for poop bag compartment)
- Two belt-loop slots on the back
- Rubber grommet at the bottom for dispensing bags
- NO zipper visible from the front

BINDING/EDGES:
Subtle tonal binding — slightly darker shade of the body color. NEVER bright or contrasting. Nearly invisible.

MATERIALS:
- Body: ${materialDesc}
- All embroidery and applique: flat, flush with surface
- Eyes: FLAT embroidered (NOT plastic, NOT 3D, NOT safety eyes)
- Hardware: dark/brushed silver carabiner, silver snap, dark zipper
- Ears: fabric, double-layer
- Small paw tabs: charcoal grey felt

PHOTOGRAPHY:
- Pure white background, professional product photography
- Studio lighting: soft diffused
- Camera angle: straight-on front view or very slight 3/4 angle
- Sharp focus, premium e-commerce style
- The product should look PREMIUM, COMPACT, WELL-CRAFTED
${data.dogName ? `- Custom product for "${data.dogName}"` : ''}

ABSOLUTE RULES:
- The face covers the ENTIRE front — there is NO visible separate flap, lid, or panel division from the outside
- ALL face elements are FLAT embroidery/applique — nothing raised, nothing 3D, no plastic eyes
- Body fabric color MUST match the dog's dominant coat color${hasPhotos ? ' as seen in the photo' : ''}
- NO white/cream body unless the dog is actually predominantly white
- Ears are SMALL and to the sides — they do NOT impede the top opening
- NO zipper visible from front
- NO text, watermarks, or branding
- NO human hands
- Binding is TONAL (blends with body), never bright/contrasting
- COLOR PALETTE: Only the dog's coat colors + black + cream/beige (muzzle) + charcoal grey + silver. No other colors.
- This is a FUNCTIONAL POUCH, not a plush toy
- Must look manufacturable and real`;
}

/**
 * Generate one image using the model fallback chain.
 * Returns a single { imageBase64, mimeType } or null.
 */
async function generateOneImage(
  contentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>,
  prompt: string,
  apiKey: string,
  photoCount: number,
): Promise<{ imageBase64: string; mimeType: string } | null> {
  const IMAGE_MODELS = [
    'gemini-2.0-flash-exp-image-generation',
    'gemini-2.5-flash-image',
  ];

  for (const model of IMAGE_MODELS) {
    console.log(`[ProductPreview] Trying model: ${model}${photoCount > 0 ? ` (with ${photoCount} dog photo reference${photoCount > 1 ? 's' : ''})` : ''}`);
    const result = await tryGeminiImageGen(contentParts, model, apiKey);
    if (result) return result;
  }

  // Fallback: Imagen 4 Fast (text-only)
  console.log('[ProductPreview] Trying Imagen 4 Fast fallback (text-only)');
  return await tryImagen(prompt, apiKey);
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

    // Build content parts — all dog photos first, then text prompt
    const contentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
    let photoCount = 0;

    // Multi-photo support: dogPhotos array takes priority
    if (dogPhotos && dogPhotos.length > 0) {
      for (const photo of dogPhotos) {
        if (photo.data && photo.mimeType) {
          contentParts.push({
            inlineData: {
              mimeType: photo.mimeType,
              data: photo.data,
            },
          });
          photoCount++;
        }
      }
    } else if (dogPhoto && dogPhotoMimeType) {
      // Backward compat: single photo
      contentParts.push({
        inlineData: {
          mimeType: dogPhotoMimeType,
          data: dogPhoto,
        },
      });
      photoCount = 1;
    }

    const prompt = buildProductPreviewPrompt(body, photoCount);
    contentParts.push({ text: prompt });

    const requestedCount = Math.min(Math.max(body.count || 1, 1), 2);

    if (requestedCount === 2) {
      // Fire two generations in parallel
      console.log(`[ProductPreview] Generating 2 preview options in parallel (${photoCount} reference photos)`);
      const [resultA, resultB] = await Promise.all([
        generateOneImage(contentParts, prompt, GEMINI_API_KEY, photoCount),
        generateOneImage(contentParts, prompt, GEMINI_API_KEY, photoCount),
      ]);

      const images: Array<{ imageBase64: string; mimeType: string }> = [];
      if (resultA) images.push(resultA);
      if (resultB) images.push(resultB);

      if (images.length === 0) {
        return NextResponse.json(
          { error: 'Product preview generation not available. All models failed.' },
          { status: 503 }
        );
      }

      return NextResponse.json({ images });
    }

    // Single image (default / backward compatible)
    const result = await generateOneImage(contentParts, prompt, GEMINI_API_KEY, photoCount);
    if (result) {
      return NextResponse.json(result);
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
 * Now supports multimodal input (text + multiple image references)
 */
async function tryGeminiImageGen(
  contentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>,
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
              parts: contentParts,
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
 * Fallback: Try using Imagen 4 Fast for image generation (text-only)
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
