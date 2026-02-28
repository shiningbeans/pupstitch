import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SCENE_PROMPTS = [
  'sitting on a cozy knitted blanket on a sofa, warm indoor lighting, a potted plant in the background, hygge aesthetic',
  'sitting on a wooden park bench surrounded by spring flowers and soft bokeh greenery, golden hour sunlight',
  'sitting on a sandy beach with gentle ocean waves in the background, warm sunset glow, peaceful and serene',
];

interface ScenicRequestData {
  breedName: string;
  primaryColor: string;
  secondaryColor?: string;
  muzzleColor?: string;
  noseColor?: string;
  earShape?: string;
  dogPhoto?: string;
  dogPhotoMimeType?: string;
  dogPhotos?: Array<{ data: string; mimeType: string }>;
}

function buildScenicPrompt(data: ScenicRequestData, scene: string): string {
  const breedName = data.breedName.replace(/-/g, ' ');

  return `Generate a beautiful, high-fidelity photograph of a cute handmade CROCHET AMIGURUMI stuffed toy dog that looks like a ${breedName}.

THE CROCHET DOG:
- Made from yarn with clearly visible crochet texture (tiny V-shaped stitches covering the entire surface)
- Round, kawaii proportions with a slightly oversized head
- Body/head yarn color: ${data.primaryColor}
${data.secondaryColor ? `- Secondary markings yarn color: ${data.secondaryColor}` : ''}
${data.muzzleColor ? `- Muzzle area yarn color: ${data.muzzleColor}` : ''}
- Small round black safety eyes with white highlight glint
- A small embroidered ${data.noseColor || 'black'} nose (rounded triangle shape)
- MOUTH: A clear UPWARD-FACING SEMICIRCLE smile embroidered in dark thread below the nose — the mouth MUST curve UPWARD showing a HAPPY, SMILING expression. NOT a frown, NOT downturned.
- Ears: ${data.earShape || 'floppy'} style, made from yarn
- The toy is approximately 15cm tall, sitting upright

SCENE: The crochet amigurumi dog is ${scene}.

PHOTOGRAPHY STYLE:
- High-fidelity, sharp focus on the crochet toy with beautiful depth-of-field background blur
- Professional lifestyle product photography — the kind you'd see in a premium craft brand lookbook
- Warm, inviting color palette — the scene should feel cozy and aspirational
- Natural lighting feel (not studio flat-lit)
- The crochet toy should be the clear hero/subject of the image

CRITICAL CONSTRAINTS:
- The dog MUST be clearly a CROCHET AMIGURUMI toy — visible yarn texture is essential
- The toy must look handcrafted and adorable — high quality artisan feel
- NO text, watermarks, logos, or any text overlays
- NO real dogs in the image — ONLY the crochet toy
- NO human hands or people visible
- The smile MUST curve upward — happy expression`;
}

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
          contents: [{ parts: contentParts }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ScenicPhotos] ${model} error (${response.status}):`, errorText.slice(0, 200));
      return null;
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        console.log(`[ScenicPhotos] ${model} generated image successfully`);
        return { imageBase64: part.inlineData.data, mimeType: part.inlineData.mimeType };
      }
    }

    console.warn(`[ScenicPhotos] ${model} responded but no image in output`);
    return null;
  } catch (error) {
    console.error(`[ScenicPhotos] ${model} exception:`, error);
    return null;
  }
}

async function generateOneScenic(
  prompt: string,
  dogPhotos: Array<{ data: string; mimeType: string }>,
  apiKey: string,
): Promise<{ imageBase64: string; mimeType: string } | null> {
  const contentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  // Include dog photo for breed reference (just the first one)
  if (dogPhotos.length > 0) {
    contentParts.push({
      inlineData: { mimeType: dogPhotos[0].mimeType, data: dogPhotos[0].data },
    });
  }

  contentParts.push({ text: prompt });

  const models = ['gemini-2.0-flash-exp-image-generation', 'gemini-2.5-flash-image'];
  for (const model of models) {
    const result = await tryGeminiImageGen(contentParts, model, apiKey);
    if (result) return result;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body: ScenicRequestData = await request.json();

    if (!body.breedName) {
      return NextResponse.json({ error: 'Missing breed name' }, { status: 400 });
    }
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    // Collect dog photos
    const dogPhotos: Array<{ data: string; mimeType: string }> = [];
    if (body.dogPhotos && body.dogPhotos.length > 0) {
      dogPhotos.push(...body.dogPhotos.filter(p => p.data && p.mimeType));
    } else if (body.dogPhoto && body.dogPhotoMimeType) {
      dogPhotos.push({ data: body.dogPhoto, mimeType: body.dogPhotoMimeType });
    }

    // Generate 3 scenic photos in parallel
    console.log(`[ScenicPhotos] Generating 3 scenic photos for ${body.breedName}`);
    const results = await Promise.all(
      SCENE_PROMPTS.map((scene) => {
        const prompt = buildScenicPrompt(body, scene);
        return generateOneScenic(prompt, dogPhotos, GEMINI_API_KEY!);
      })
    );

    const images = results.filter(Boolean) as Array<{ imageBase64: string; mimeType: string }>;

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'Scenic photo generation failed. All models failed.' },
        { status: 503 }
      );
    }

    console.log(`[ScenicPhotos] Generated ${images.length}/3 scenic photos`);
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Scenic photo generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scenic photo generation failed' },
      { status: 500 }
    );
  }
}
