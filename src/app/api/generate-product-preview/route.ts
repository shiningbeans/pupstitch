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
}

/**
 * Build the detailed product preview prompt
 */
function buildProductPreviewPrompt(data: PreviewRequestData): string {
  // Map ear style to description
  const earStyleDesc = data.earStyle === 'pointy'
    ? 'small pointed fabric ears that stand upright, extending slightly above the top edge'
    : data.earStyle === 'rose'
    ? 'small folded rose-shaped fabric ears that curve slightly at the sides near the top'
    : data.earStyle === 'button'
    ? 'small folded button ears that sit neatly on the sides near the top'
    : 'small floppy fabric ears that drape softly to the sides near the top';

  const earSizeDesc = EAR_SIZE_DESCRIPTIONS[data.earSize] || EAR_SIZE_DESCRIPTIONS['medium'];
  const materialDesc = MATERIAL_DESCRIPTIONS[data.material] || MATERIAL_DESCRIPTIONS['canvas'];

  const hasDogPhoto = !!data.dogPhoto;
  const photoContext = hasDogPhoto
    ? `\n\nREFERENCE: I've attached a photo of the actual ${data.breedName} dog. Use the dog's COLORING, MARKINGS, and FACE CHARACTERISTICS as inspiration for the embroidered face design and color palette of the product. The product should capture this specific dog's personality through color-matching and a simplified cute embroidered version of its face on the front flap.`
    : '';

  return `Generate a photorealistic product photograph of a small dog-themed POOP BAG DISPENSER POUCH called "LeashBuddy", designed to resemble a ${data.breedName}.${photoContext}

THIS IS THE MOST IMPORTANT INSTRUCTION — THE PRODUCT SHAPE:
The LeashBuddy is a SMALL COMPACT RECTANGULAR FABRIC POUCH. It is NOT a plush toy, NOT a stuffed animal, NOT a figurine, and NOT a dog-shaped object. It is a RECTANGULAR BAG/POUCH — like a small pencil case or playing-card-deck-sized fabric container — with subtle dog-inspired decorative elements (embroidered face, small fabric ears, color palette).

EXACT DIMENSIONS AND SCALE:
- Height: ${data.dimensions.heightCm}cm (about ${Math.round(data.dimensions.heightCm / 2.54 * 10) / 10} inches)
- Width: ${data.dimensions.widthCm}cm
- Depth: ${data.dimensions.depthCm}cm
- For scale reference: roughly the size of a deck of playing cards or a small smartphone
- The bottom compartment holds a standard poop bag roll (3.5cm / 1.4" diameter)

PRODUCT STRUCTURE (from top to bottom):
1. ATTACHMENT TAB: A small fabric loop/tab at the very top center. A silver spring-gate carabiner clip hangs from this tab for clipping onto a leash handle.
2. FACE FLAP (upper 40% of front): A rectangular flap that opens downward, secured by a small silver snap button at the bottom of the flap. The front surface of this flap has an EMBROIDERED cute, kawaii-style ${data.breedName} face — two small round black bead eyes, a small embroidered triangle nose, tiny curved smile line. The embroidery is FLAT on the fabric surface, not 3D.
3. EARS: ${earStyleDesc}. The ears are ${earSizeDesc}. They are made of double-layer fabric and sewn to the top corners of the pouch where the flap meets the body.
4. MAIN BODY (middle 30%): Below the flap, the front of the body has two small embroidered paw prints side by side.
5. BAG COMPARTMENT (lower 30%): The back/bottom has a zippered compartment to insert a poop bag roll. A small round rubber grommet hole at the very bottom center allows bags to be pulled out. A few dark gray poop bags peek out from this hole.
6. BACK PANEL: Clean flat back with a small embossed dog-silhouette logo, two vertical fabric belt-loop slots for optional belt attachment, and the horizontal zipper for the bag compartment.

MATERIALS AND COLORS:
- Main body material: ${materialDesc} in the color ${data.primaryColor}
${data.flapColor ? `- Front flap: ${data.flapColor}` : `- Front flap: Same as main body (${data.primaryColor})`}
- Ears (outer): ${data.secondaryColor}
${data.earInnerColor ? `- Ears (inner lining): ${data.earInnerColor}` : ''}
- Edge binding/piping trim: ${data.accentColor}
- All raw edges are neatly finished with narrow binding/piping for a clean, professional look
- Hardware: Brushed silver carabiner clip, snap button, and zipper pull
- Zipper: Dark tone (#5 nylon coil)
${data.embroideryDescription ? `- Embroidery detail: ${data.embroideryDescription}` : ''}

PHOTOGRAPHY STYLE:
- Clean, professional product photography on a PURE WHITE background
- Studio lighting: soft diffused key light from upper-left, subtle fill light
- Camera angle: 3/4 front view showing the face and one side edge
- Sharp focus on the product with very slight depth-of-field on the background
- Style reference: professional e-commerce/Kickstarter product shot
- The product should look PREMIUM, COMPACT, WELL-CRAFTED, and GIFTABLE
- Think: Apple product photography meets cute pet accessories
${data.dogName ? `- This is a custom product made for a dog named "${data.dogName}"` : ''}

CRITICAL CONSTRAINTS:
- The overall shape MUST be a clean rectangle/box — the dog likeness comes from COLOR + EMBROIDERED FACE, not from the shape
- NO text, watermarks, logos, or branding visible
- NO human hands in the image
- The ears are the ONLY elements that extend slightly beyond the rectangular body silhouette
- The product should look like it could be manufactured and sold — realistic, not fantastical
- Do NOT make it look like a plush toy or stuffed animal`;
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

    // Add dog photo as reference if provided
    if (dogPhoto && dogPhotoMimeType) {
      contentParts.push({
        inlineData: {
          mimeType: dogPhotoMimeType,
          data: dogPhoto,
        },
      });
    }

    contentParts.push({ text: prompt });

    // Try each Gemini image generation model in order
    const IMAGE_MODELS = [
      'gemini-2.0-flash-exp-image-generation',
      'gemini-2.5-flash-image',
    ];

    for (const model of IMAGE_MODELS) {
      console.log(`[ProductPreview] Trying model: ${model}${dogPhoto ? ' (with dog photo reference)' : ''}`);
      const result = await tryGeminiImageGen(contentParts, model, GEMINI_API_KEY);
      if (result) {
        return NextResponse.json(result);
      }
    }

    // Fallback: try Imagen 4 Fast (text-only, no image reference support)
    console.log('[ProductPreview] Trying Imagen 4 Fast fallback (text-only)');
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
