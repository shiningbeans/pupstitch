import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function buildPrompt(userBreeds?: string[], colorContext?: { yarnColors: Array<{name: string, hex: string, bodyPart?: string}> }): string {
  let breedHint = '';
  if (userBreeds && userBreeds.length > 0) {
    if (userBreeds.length === 1) {
      breedHint = `\nIMPORTANT CONTEXT: The owner has identified this dog as a "${userBreeds[0]}" (or mix). Use this as a strong prior when analyzing breed, but still rely on the image for colors, markings, proportions, and features. If the image clearly shows a different breed, note that in alternativeBreeds.`;
    } else {
      const breedList = userBreeds.join(', ');
      breedHint = `\nIMPORTANT CONTEXT: The owner has identified this dog as a mix of these breeds: ${breedList}. Use the FIRST breed listed ("${userBreeds[0]}") as the primary breed for body shape and proportions, but blend characteristics from all listed breeds. Consider how these breeds' features combine — for example, colors might come from one breed while ear shape comes from another. Still rely on the image for actual colors, markings, and proportions.`;
    }
  }

  let colorHint = '';
  if (colorContext && colorContext.yarnColors.length > 0) {
    const colorLines = colorContext.yarnColors.map(c =>
      `- ${c.name} (${c.hex})${c.bodyPart ? ` for ${c.bodyPart}` : ''}`
    ).join('\n');
    colorHint = `\n\nUSER'S YARN COLOR CHOICES:\nThe user has selected these specific yarn colors for their amigurumi. When providing crochet notes in bodyPartAnalysis, reference these exact yarn color names instead of generic color descriptions:\n${colorLines}\nFor example, instead of "use a lighter color for the belly", say "switch to the [specific yarn name] yarn for the belly". Adjust your crochetNotes to be specific about which of these yarns to use for each part.`;
  }

  return `You are analyzing a dog photo to create a crochet amigurumi (stuffed toy) pattern. Your job is to extract the visual details needed to create a yarn pattern that looks like this specific dog — accurate colors, markings, proportions, and features.${breedHint}${colorHint}

COLOR PRIORITY — CRITICALLY IMPORTANT:
1. PHOTO FIRST: Sample ALL colors directly from the actual pixels in the photo. Do NOT invent colors.
2. BE FAITHFUL: If the dog is mostly one color, return that color as primary and set secondary/tertiary to null. Do NOT force contrast by making up a lighter or darker version.
3. ONLY REAL DIFFERENCES: Only return a secondary color if you can clearly see a distinctly different color region in the photo (e.g., a white chest on a brown dog, tan points on a black dog). Subtle lighting variation on the same color is NOT a second color.
4. BREED AS FALLBACK ONLY: Use breed knowledge only when the photo is ambiguous or poorly lit. Never override what you clearly see in the photo with what a breed "typically" looks like.
5. PER-BODY-PART ACCURACY: Each body part's primaryColor should be sampled from that specific area of the photo. A golden retriever's ears, body, and legs may all be the same golden color — that's correct, report them all as the same color.

Analyze this image carefully and return a JSON object. Be precise about hex colors — sample them from the actual coat in the photo. Pay special attention to unique markings and color patterns that make this dog individual.

IMPORTANT: Analyze each body part individually. For each part, describe the exact colors, markings, texture, and shape so that a crocheter can recreate this specific dog's appearance in yarn. This is what makes the pattern unique to THIS dog.

Return ONLY valid JSON, no other text:
{
  "detectedBreed": "the most likely breed (use lowercase with hyphens, e.g. 'golden-retriever', 'french-bulldog', 'labrador')",
  "confidenceScore": 0.0 to 1.0,
  "alternativeBreeds": ["other possible breeds if uncertain"],
  "colors": {
    "primary": "#hex of the dominant coat color — sample directly from the largest color area in the photo",
    "secondary": "#hex of second color ONLY if clearly visible as a distinct region — null if the dog is solid-colored or nearly so",
    "tertiary": "#hex of third color ONLY if clearly present — null otherwise",
    "accent": "#hex for nose/paw pads/eye rims — sample from the photo if visible"
  },
  "colorConfidence": 0.0 to 1.0,
  "markings": [
    {
      "type": "one of: spot, patch, saddle, brindle, merle, tricolor, tuxedo, blaze, mask, tan-points, particolor, dapple, sable, ticking",
      "location": "one of: head, body, frontLeg, backLeg, ear, tail, chest, belly, face",
      "coverage": 0.0 to 1.0 (what fraction of that body area the marking covers),
      "colors": ["#hex colors used in the marking"]
    }
  ],
  "earShape": "one of: pointy, floppy, button, rose, pendant, droopy, bat, cropped",
  "tailType": "one of: curled, straight, plumed, docked, whip, flag, otter, sickle, corkscrew",
  "bodyProportions": {
    "headToBodyRatio": 0.2 to 0.4 (how big the head is relative to the body),
    "legLength": 0.2 to 0.5 (leg length relative to body height),
    "tailLength": 0.1 to 0.5 (tail length relative to body),
    "earSize": 0.1 to 0.4 (ear size relative to head),
    "snoutLength": 0.2 to 0.4 (snout length relative to head),
    "buildType": "one of: slender, athletic, stocky, massive"
  },
  "bodyPartAnalysis": [
    {
      "partName": "head",
      "colors": ["#hex colors visible on the head"],
      "primaryColor": "#dominant head color",
      "markings": ["description of any markings on the head - e.g., 'white blaze between eyes', 'darker forehead'"],
      "shape": "round, oval, boxy, wedge-shaped, etc.",
      "texture": "smooth, fluffy, curly, wiry, short, long",
      "relativeSize": 0.1 to 1.0 (relative to body),
      "crochetNotes": "specific guidance for recreating this head in crochet - e.g., 'use wider increases for broad skull, switch to secondary color at row 8 for forehead marking'"
    },
    {
      "partName": "ears",
      "colors": ["#hex colors on ears"],
      "primaryColor": "#dominant ear color",
      "markings": ["e.g., 'darker tips', 'lighter inner ear'"],
      "shape": "floppy/pointy/bat/rose with specific details",
      "texture": "smooth, feathered, fluffy",
      "relativeSize": 0.1 to 0.4,
      "crochetNotes": "e.g., 'make triangular with 15 rows, fold tip forward for button ear look'"
    },
    {
      "partName": "body",
      "colors": ["#hex colors on the torso"],
      "primaryColor": "#dominant body color",
      "markings": ["e.g., 'saddle marking on back', 'white chest', 'brindle pattern on sides'"],
      "shape": "barrel-chested, slender, stocky, long, compact",
      "texture": "smooth, double-coated, curly",
      "relativeSize": 1.0,
      "crochetNotes": "e.g., 'elongated oval shape, use color changes at row 12 for saddle marking, stuff firmly'"
    },
    {
      "partName": "legs",
      "colors": ["#hex colors on the legs"],
      "primaryColor": "#dominant leg color",
      "markings": ["e.g., 'tan points on front legs', 'white socks on paws'"],
      "shape": "short and stubby, long and slender, muscular",
      "texture": "smooth, feathered",
      "relativeSize": 0.2 to 0.5,
      "crochetNotes": "e.g., 'short cylinders with 8 rows, use cream for paw area (last 2 rows)'"
    },
    {
      "partName": "tail",
      "colors": ["#hex colors on the tail"],
      "primaryColor": "#dominant tail color",
      "markings": ["e.g., 'white tip', 'darker base'"],
      "shape": "curled, straight, plumed, docked/short, sickle",
      "texture": "fluffy, smooth, feathered, bushy",
      "relativeSize": 0.1 to 0.5,
      "crochetNotes": "e.g., 'curved cone shape, 10 rows tapering from 12 to 4 stitches, stuff lightly'"
    },
    {
      "partName": "snout",
      "colors": ["#hex colors on the snout/muzzle area"],
      "primaryColor": "#dominant snout color",
      "markings": ["e.g., 'black muzzle', 'lighter whisker area'"],
      "shape": "long and narrow, short and flat, medium, pointed",
      "texture": "smooth",
      "relativeSize": 0.1 to 0.3,
      "crochetNotes": "e.g., 'short oval for flat-faced breed, only 5 rows, attach flush to head'"
    },
    {
      "partName": "nose",
      "colors": ["#hex - usually black, brown, or pink"],
      "primaryColor": "#nose color",
      "markings": [],
      "shape": "round, triangular, wide, narrow",
      "texture": "smooth",
      "relativeSize": 0.05,
      "crochetNotes": "e.g., 'small triangle in black yarn, embroider nostrils with satin stitch'"
    }
  ],
  "distinctiveFeatures": [
    {
      "name": "feature name (e.g. 'white chest patch', 'merle eye', 'curly coat')",
      "location": "body part where the feature is visible",
      "description": "brief description for a crocheter to recreate this feature in yarn",
      "confidence": 0.0 to 1.0
    }
  ],
  "estimatedAge": "one of: puppy, young, adult, senior",
  "estimatedSize": "one of: small, medium, large, xlarge"
}`;
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mimeType, selectedBreeds, colorContext } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured. Add it to .env.local — get a free key at https://aistudio.google.com/apikey' },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(selectedBreeds || undefined, colorContext || undefined);

    // Call Gemini Vision API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: imageBase64,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4000,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: `Gemini API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from Gemini' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let analysisJson;
    try {
      analysisJson = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisJson = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse Gemini response as JSON');
      }
    }

    // Add metadata
    analysisJson.analysisTimestamp = new Date().toISOString();
    analysisJson.modelVersion = 'gemini-2.0-flash';
    analysisJson.photoUrl = '';

    return NextResponse.json(analysisJson);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
