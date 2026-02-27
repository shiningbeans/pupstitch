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
  'small': 'very small and subtle, extending less than 1cm beyond the body edge',
  'medium': 'medium-sized, extending about 1-2cm beyond the body edge',
  'large': 'prominent and expressive, extending 2-3cm beyond the body edge',
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
  dogPhoto?: string;       // base64 image data (no prefix)
  dogPhotoMimeType?: string;
  count?: number;          // number of preview variants to generate (1 or 2)
}

/**
 * Build the detailed product preview prompt
 */
function buildProductPreviewPrompt(data: PreviewRequestData): string {
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

  const hasDogPhoto = !!data.dogPhoto;
  const photoContext = hasDogPhoto
    ? `\n\nREFERENCE PHOTO: I've attached a photo of the actual ${data.breedName} dog. Study this dog's face carefully — its COLORING, MARKINGS, EYE PLACEMENT, and FACIAL STRUCTURE. The front of the pouch must look like a cute simplified cartoon version of THIS SPECIFIC DOG'S FACE, using the pouch's full front surface as the face canvas. Match the dog's colors using different colored fabric panels for markings and patches.`
    : '';

  return `Generate a photorealistic product photograph of a small dog-themed POOP BAG DISPENSER POUCH called "LeashBuddy", designed to look like a cute ${data.breedName} face.${photoContext}

THE SINGLE MOST IMPORTANT DESIGN PRINCIPLE:
When you look at the FRONT of this pouch, the ENTIRE FRONT IS THE DOG'S FACE. The pouch doesn't have a face "on" it — the pouch IS the face. The face is not a small embroidered design, not a patch, not a badge, not a medallion, not a circular detail sitting on the fabric. The whole front surface — from ear to ear, from forehead down to chin — IS a cute, simplified, cartoon-style ${data.breedName} face.

HOW THE FACE IS CONSTRUCTED:
The face is built from LARGE FABRIC PANELS and PIECES that together form the facial features at full scale across the flap:

- EYES: Two large, round, shiny BLACK PLASTIC SAFETY EYES (the kind used in stuffed animals) — prominent, glossy, 8-10mm diameter bead eyes that catch the light. They sit directly on the fabric surface about 1/3 of the way down from the top of the flap, spaced apart symmetrically. These are NOT embroidered — they are physical 3D round shiny bead eyes pushed through the fabric and secured.
- MUZZLE/SNOUT: A LARGE separate piece of lighter-colored fabric (white, cream, or pale) cut into a wide rounded U-shape or oval, sewn onto the lower half of the flap. This muzzle piece is PROMINENT — it takes up roughly the bottom third of the face area. It is a separate fabric panel with visible topstitching around its edge.
- NOSE: A small solid BLACK fabric piece (triangular or rounded) centered at the top of the muzzle area, between and slightly below the eyes.
- MOUTH: A simple, small, cute curved smile line — this can be a short embroidered stitch line below the nose, like a tiny "w" or curved line. This is the ONLY element that may use embroidery thread.
- BREED MARKINGS/PATCHES: For breeds with distinctive markings (patches over eyes, two-tone face, color splits), these are LARGE SEPARATE FABRIC PIECES in the dog's secondary color, cut to shape and sewn onto the face panel. For example, a beagle gets a large brown patch over one eye area; a dalmatian gets black spots as separate fabric circles. These patches are BIG — covering substantial areas of the face, not small decorative details.

The face panel is the dog's PRIMARY COLOR as the base, with the muzzle, markings, and other features layered on top as separate fabric pieces. The overall look is GRAPHIC, BOLD, and KAWAII — like a cute Japanese character design translated into fabric construction.

PRODUCT SHAPE:
The LeashBuddy is a SMALL COMPACT RECTANGULAR FABRIC POUCH — like a small pencil case or playing-card-deck-sized container. It is NOT a plush toy, NOT a stuffed animal. The front face takes up the flap area, and the 3D double-layer fabric ears at the top corners and the paw prints below are what give it its dog character.

EXACT DIMENSIONS AND SCALE:
- Height: ${data.dimensions.heightCm}cm (about ${Math.round(data.dimensions.heightCm / 2.54 * 10) / 10} inches)
- Width: ${data.dimensions.widthCm}cm
- Depth: ${data.dimensions.depthCm}cm
- For scale reference: roughly the size of a deck of playing cards or a small smartphone

PRODUCT STRUCTURE (from top to bottom):
1. CARABINER CLIP + TAB: A fabric loop tab at the top center, with a silver spring-gate carabiner clip hanging from it for leash attachment.
2. FACE FLAP (upper ~45% of front): A rectangular flap that opens downward, secured by a small silver snap button at bottom-center. THE ENTIRE FRONT SURFACE OF THIS FLAP IS THE DOG FACE as described above — large bead eyes, big muzzle piece, breed-colored fabric patches, cute nose. The face fills the flap edge-to-edge.
3. EARS: 3D double-layer ${earStyleDesc}. The ears are ${earSizeDesc}. Outer fabric: ${data.secondaryColor}. Inner fabric: ${data.earInnerColor || 'lighter contrasting shade'}. They extend outward from the top corners of the pouch — the ears are one of the most characterful elements.
4. LOWER BODY (below the flap): Two small paw print designs side by side. These paw prints are also fabric pieces (not embroidery) — small circles with toe-pad shapes in a slightly darker or contrasting color. Below the paw area is the binding/seam separating the upper compartment from the bag compartment.
5. BAG DISPENSER (bottom): A zippered compartment holding a poop bag roll, with a round rubber grommet hole at the very bottom where dark poop bags peek out.
6. BACK PANEL: Clean flat back with a small embossed/printed dog silhouette logo, two vertical fabric belt-loop slots, and the horizontal zipper for the bag compartment.

MATERIALS AND COLORS:
- Main body & face base material: ${materialDesc} in ${data.primaryColor}
${data.flapColor ? `- Face flap base panel: ${data.flapColor}` : `- Face flap base panel: Same as main body (${data.primaryColor})`}
- Muzzle/snout fabric piece: white or cream (lighter than body)
- Breed marking patches: ${data.secondaryColor} fabric
- Eyes: glossy black plastic safety eyes (round, shiny, 3D)
- Nose: solid black fabric piece
- Ears outer: ${data.secondaryColor}
${data.earInnerColor ? `- Ears inner: ${data.earInnerColor}` : ''}
- Edge binding/piping: ${data.accentColor} — neat narrow trim around all raw edges
- Hardware: Brushed silver carabiner, snap button, zipper pull
- Zipper: Dark tone (#5 nylon coil)

PHOTOGRAPHY STYLE:
- Clean, professional product photography on a PURE WHITE background
- Studio lighting: soft diffused key light from upper-left, subtle fill light
- Camera angle: 3/4 front view showing the full face and one side edge
- Sharp focus, slight background depth-of-field blur
- Style: premium e-commerce / Kickstarter product shot — the kind you'd see on a high-end pet accessories brand
- The product should look PREMIUM, COMPACT, WELL-CRAFTED, and GIFTABLE
${data.dogName ? `- Custom product made for a dog named "${data.dogName}"` : ''}

CRITICAL CONSTRAINTS — READ CAREFULLY:
- The ENTIRE front flap must BE the dog's face — NOT a small embroidered design sitting on the flap
- The face must FILL the flap from edge to edge — big eyes, big muzzle, full coverage
- Eyes MUST be shiny round plastic/bead safety eyes — NOT embroidered, NOT flat fabric
- The muzzle MUST be a large, separate, clearly visible piece of lighter fabric
- Breed marking patches must be LARGE fabric panels, not tiny details
- Do NOT render the face as embroidery thread-work, screen printing, a sewn-on circular patch, or a badge
- The face should look like a CUTE CARTOON DOG FACE built from fabric pieces — bold, graphic, kawaii
- NO text, watermarks, or branding visible anywhere
- NO human hands in the image
- Ears extend from the top corners — they are the main element breaking the rectangular silhouette
- The product must look manufacturable and real — not fantastical
- Do NOT make it look like a plush toy or stuffed animal — it is a functional BAG with a cute face`;
}

/**
 * Generate one image using the model fallback chain.
 * Returns a single { imageBase64, mimeType } or null.
 */
async function generateOneImage(
  contentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>,
  prompt: string,
  apiKey: string,
  hasDogPhoto: boolean,
): Promise<{ imageBase64: string; mimeType: string } | null> {
  const IMAGE_MODELS = [
    'gemini-2.0-flash-exp-image-generation',
    'gemini-2.5-flash-image',
  ];

  for (const model of IMAGE_MODELS) {
    console.log(`[ProductPreview] Trying model: ${model}${hasDogPhoto ? ' (with dog photo reference)' : ''}`);
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

    const prompt = buildProductPreviewPrompt(body);

    // Build content parts — text prompt + optional dog photo reference
    const contentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    if (dogPhoto && dogPhotoMimeType) {
      contentParts.push({
        inlineData: {
          mimeType: dogPhotoMimeType,
          data: dogPhoto,
        },
      });
    }

    contentParts.push({ text: prompt });

    const requestedCount = Math.min(Math.max(body.count || 1, 1), 2);

    if (requestedCount === 2) {
      // Fire two generations in parallel
      console.log('[ProductPreview] Generating 2 preview options in parallel');
      const [resultA, resultB] = await Promise.all([
        generateOneImage(contentParts, prompt, GEMINI_API_KEY, !!dogPhoto),
        generateOneImage(contentParts, prompt, GEMINI_API_KEY, !!dogPhoto),
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
    const result = await generateOneImage(contentParts, prompt, GEMINI_API_KEY, !!dogPhoto);
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
 * Now supports multimodal input (text + image reference)
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
