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
    ? `\n\nCOLOR ACCURACY — CRITICAL (OVERRIDE ALL HEX COLOR VALUES BELOW):
Study the dog photo${photoCount > 1 ? 's' : ''} and estimate the percentage breakdown of colors on the dog's coat/fur ONLY. For example: "60% golden brown, 25% cream, 15% black".
- IGNORE any specific hex color values mentioned later in this prompt. Determine ALL colors from the dog photo${photoCount > 1 ? 's' : ''} instead.
- Use ONLY colors visible on the DOG'S FUR and COAT — completely IGNORE background colors (walls, floors, furniture, grass, human hands, clothing, blankets, or any non-dog element in the photo).
- The pouch BODY FABRIC must be dyed/colored to match the dog's DOMINANT coat color (the highest percentage color). The body IS the dog's base fur color. Do NOT default to white or cream unless the dog is actually predominantly white or cream (over 50% white fur).
- Apply the dog's SECONDARY coat colors as the marking patches, ear colors, and accent pieces — proportional to how much of the dog's coat they actually cover.
- If the dog has a brown/golden/tan coat, the pouch body MUST be that brown/golden/tan color — NOT white.
- The muzzle/snout piece should match the actual color around the dog's mouth and chin area.
- Think of it this way: the pouch fabric IS the dog's fur. The body color should be the base coat color, with markings layered on top.`
    : '';

  return `Generate a photorealistic product photograph of a small dog-themed POOP BAG DISPENSER POUCH called "LeashBuddy", designed to look like a cute ${data.breedName}.${photoContext}${colorSamplingInstructions}

CORE CONCEPT:
This is a compact rectangular fabric pouch — NOT a plush toy, NOT a stuffed animal. The front face flap has a FLAT EMBROIDERED face design of a cute ${data.breedName}. The entire face design is FLAT — machine embroidery thread and flat fabric applique pieces sewn flush to the surface. Nothing on the face is raised or 3D. The pouch also has double-layer fabric ears at the top corners and embroidered paw prints on the lower front body.

EMBROIDERY STYLE — CRITICAL:
The face embroidery must look like a clean, flat, VECTOR-ILLUSTRATION style design — the kind produced by a modern computerized embroidery machine. Think: cute kawaii graphic design rendered in thread, NOT a 3D sculpture or stuffed animal face. Every element is FLAT and flush with the fabric surface. The style is bold, clean lines with solid filled areas of color — like a simplified cartoon/icon.

EXACT DIMENSIONS (per engineering drawing):
- Total height (body only, no tab/clip): ${data.dimensions.heightCm}cm
- Width: ${data.dimensions.widthCm}cm
- Depth: ${data.dimensions.depthCm}cm
- Face flap area: approximately 5cm tall (the upper section)
- Lower body section: approximately 4.5cm tall (below the flap)
- Fabric tab above body: 3.5cm (connects to spring hook/carabiner)
- For scale: roughly the size of a deck of playing cards or a small smartphone

FRONT VIEW — TOP TO BOTTOM:

1. SPRING HOOK + FABRIC TAB (top):
   A 3.5cm fabric loop tab sewn at the top center of the pouch. A silver/dark spring-gate carabiner clip hangs from this tab. The tab is the same ${materialDesc} as the body.

2. DOUBLE-LAYER EARS (top corners):
   ${earStyleDesc}. The ears are ${earSizeDesc}. Each ear is double-layered: outer fabric in ${data.secondaryColor}, inner fabric in ${data.earInnerColor || 'a lighter contrasting shade'}. They are sewn into the top-left and top-right seams of the pouch body and extend outward to the SIDES, breaking the rectangular silhouette. The ears must be small enough that they do NOT interfere with the face flap opening — they sit at the side corners, out of the way of the top hinge.

3. FACE FLAP / OPENING FLAP (upper ~5cm of front):
   The top section is a flap that opens downward, secured by a small silver snap button at its bottom center. When CLOSED (as shown in this photo), the flap sits flush with the lower body — the seam between flap and body is barely visible. The flap has a FLAT EMBROIDERED FACE covering its surface — a cute ${data.breedName} face in the following FLAT, GRAPHIC style:

   - EYES: Two solid BLACK FILLED CIRCLES (approximately 6-8mm) made of dense satin-stitch embroidery thread — completely FLAT against the fabric. Each eye has a TINY white highlight dot (1-2mm) in the upper-right area, also embroidered. The eyes look like two little black buttons drawn in a cute cartoon style. They are NOT 3D, NOT plastic, NOT raised, NOT glossy, NOT safety eyes — they are FLAT embroidered circles flush with the fabric surface.
   - MUZZLE/SNOUT: A flat fabric applique piece in a light beige, cream, or skin-tone color, cut in a wide rounded U-shape or bean shape, sewn flat onto the lower portion of the flap. The muzzle is completely flush with the surface. It takes up roughly the bottom third of the face area.
   - NOSE: A small solid BLACK embroidered shape (rounded triangle or inverted heart) centered at the top of the muzzle, between and slightly below the eyes. Flat satin-stitch fill.
   - MOUTH: A tiny cute embroidered line below the nose — a simple "w" shape or gentle smile curve, stitched in dark thread. May include small whisker dots (3 tiny embroidered dots on each side of the muzzle).
   - BREED MARKINGS: For breeds with distinctive markings (eye patches, two-tone face, color splits), these are rendered as FLAT colored fabric applique pieces or dense flat embroidery fill in ${data.secondaryColor}. For example: beagle gets a brown patch over one eye area; husky gets a symmetrical face mask pattern; dalmatian gets flat black spots. These markings are clean-edged, graphic, and proportional to the flap size.

   IMPORTANT: The entire face design should look like a flat graphic illustration printed/stitched onto fabric. Imagine a cute dog face emoji or app icon rendered as machine embroidery — clean, bold, minimal, flat.

4. SNAP BUTTON (at flap bottom edge):
   A small silver metal snap button at the bottom-center of the face flap, securing it to the body below. This is the main closure for the upper compartment.

5. LOWER BODY (below flap, ~4.5cm):
   The lower front section has TWO SMALL EMBROIDERED PAW PRINTS side by side — cute paw pad designs stitched flat in ${data.accentColor || 'a slightly darker tone'}. Each paw print is a rounded arch/dome shape with small toe pad circles inside, all flat embroidery. This section covers the MAIN COMPARTMENT which has space for treats and extra items.

6. SMALL FABRIC PAW TABS (bottom):
   At the very bottom of the pouch, two VERY SMALL, SUBTLE flat fabric tabs (each roughly 1-1.5cm) extend slightly below the body edge — shaped like tiny simplified paw silhouettes in dark charcoal grey felt. These are small and understated, just peeking out from the bottom edge. They should NOT be large, chunky, or dangling — they are minimal decorative accents only.

7. RUBBER GROMMET (bottom center):
   A round rubber grommet hole at the very bottom center of the back/underside where dark poop bags can be pulled through from the lower compartment.

TWO SEPARATE COMPARTMENTS:
The pouch has TWO distinct internal compartments separated by a horizontal seam/binding:
- UPPER COMPARTMENT: Accessed via the face flap with snap button. Holds treats, keys, or small items.
- LOWER COMPARTMENT: Holds a poop bag roll. This compartment's zipper access is on the BACK only. Bags feed out through the rubber grommet at the bottom.

ZIPPER PLACEMENT — CRITICAL:
- The zipper is on the BACK of the pouch, running horizontally across the lower compartment area, wrapping slightly around to the sides.
- The zipper is NEVER visible from the front view. There is NO zipper on the front at all.
- The zipper provides access to load/replace the poop bag roll in the lower compartment.

BACK PANEL:
- Clean flat back in ${data.primaryColor} ${materialDesc}
- A small embroidered dog silhouette logo (subtle, tonal, flat)
- Two vertical fabric belt-loop slots for threading onto a belt or bag strap
- The horizontal zipper for the lower bag compartment (wraps from back to sides)

BINDING/EDGE DETAIL:
- All raw edges of the pouch are finished with SUBTLE TONAL binding/piping — a neat narrow trim that runs around the perimeter of the body, the flap edges, and compartment seams.
- The binding color should be a SLIGHTLY DARKER shade of the main body color, or a neutral grey/taupe. It should BLEND with the body, not contrast against it.
- NEVER use a bright or saturated color (red, blue, green, orange, pink, etc.) for the binding/piping. It should be nearly invisible — just a clean finished edge.

MATERIALS AND COLORS:
- Main body material: ${materialDesc} in ${data.primaryColor}
${data.flapColor ? `- Face flap base: ${data.flapColor}` : `- Face flap base: Same as main body (${data.primaryColor})`}
- Muzzle/snout applique: light beige, cream, or skin-tone fabric (lighter than body), sewn flat
- Breed marking appliques/embroidery: ${data.secondaryColor}, flat
- Eyes: FLAT black embroidered circles with tiny white highlight dot — NOT plastic, NOT 3D, NOT safety eyes
- Nose: solid black flat embroidered shape
- Ears outer: ${data.secondaryColor}
${data.earInnerColor ? `- Ears inner: ${data.earInnerColor}` : ''}
- Edge binding/piping: a subtle tone-on-tone shade slightly darker than the body (NOT a contrasting color — should nearly blend in)
- Hardware: Dark/brushed silver carabiner (spring hook), silver snap button, dark zipper pull
- Zipper: Dark tone (#5 nylon coil) — on the BACK only
- Small paw tabs at bottom: dark charcoal grey felt, very small and subtle
${data.liningColor ? `- Interior lining: ${data.liningColor}` : ''}

PHOTOGRAPHY STYLE:
- Clean, professional product photography on a PURE WHITE background
- Studio lighting: soft diffused key light from upper-left, subtle fill light
- Camera angle: 3/4 front view showing the full face and one side edge
- Sharp focus, slight background depth-of-field blur
- Style: premium e-commerce / Kickstarter product shot — the kind you'd see on a high-end pet accessories brand
- The product should look PREMIUM, COMPACT, WELL-CRAFTED, and GIFTABLE
${data.dogName ? `- Custom product made for a dog named "${data.dogName}"` : ''}

CRITICAL CONSTRAINTS:
- ALL face embroidery is FLAT — flush with the fabric. NO raised elements, NO 3D elements, NO plastic eyes, NO safety eyes, NO bulging anything
- Eyes are FLAT solid black embroidered circles with a tiny white highlight dot — like a cute cartoon/emoji eye style
- The muzzle is a FLAT lighter-colored fabric applique piece sewn onto the flap
- The nose is a FLAT black embroidered shape
- The mouth is a simple FLAT embroidered line
- The entire face looks like a FLAT GRAPHIC ILLUSTRATION — clean vector-art style rendered in embroidery thread
- Do NOT render the face as screen printing, a sewn-on circular patch/badge, or a medallion
- The face should look like a CUTE CARTOON DOG FACE — bold, graphic, kawaii/vector-illustration style
- NO text, watermarks, or branding visible anywhere
- NO human hands in the image
- Ears extend from the top corners — they break the rectangular silhouette
- Bottom paw tabs are VERY SMALL and SUBTLE — not chunky, not dangling, not prominent
- TWO compartments: upper (snap flap) and lower (back zipper)
- The product must look manufacturable and real — not fantastical
- Do NOT make it look like a plush toy or stuffed animal — it is a FUNCTIONAL POUCH with cute dog character
- NO ZIPPER on the front — the zipper is ONLY on the BACK, running horizontally
- Show the binding/piping trim around edges — but it must be TONAL (same family as body color), NEVER bright or contrasting
- BODY COLOR: The pouch body fabric MUST match the dog's dominant coat color${hasPhotos ? ' as seen in the reference photo — NOT white/cream unless the dog is genuinely predominantly white' : ''}. The body IS the dog's base fur color.
- Ears extend to the SIDES from the top corners — small and practical, not oversized
- COLOR PALETTE RULE: The ONLY colors on this product should be: the dog's coat colors (for body, ears, markings), black (eyes, nose, hardware), white/cream/beige (muzzle), dark grey/charcoal (small paw tabs, zipper), and silver (hardware). Do NOT introduce any other colors like red, blue, green, orange, pink, or any bright/saturated hue anywhere on the product.`;
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
