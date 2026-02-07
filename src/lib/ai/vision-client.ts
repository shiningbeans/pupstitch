import { DogAnalysisResult, BodyPartAnalysis } from '@/types';

/**
 * Generate default body part analysis from detected features.
 * Used as a fallback when the AI API doesn't return bodyPartAnalysis data.
 */
function generateDefaultBodyPartAnalysis(analysis: DogAnalysisResult): BodyPartAnalysis[] {
  const primary = analysis.colors.primary || '#8B4513';
  const secondary = analysis.colors.secondary || primary;
  const earShape = analysis.earShape || 'floppy';
  const tailType = analysis.tailType || 'straight';
  const build = analysis.bodyProportions?.buildType || 'athletic';
  const snoutLen = analysis.bodyProportions?.snoutLength || 0.3;

  return [
    {
      partName: 'head',
      colors: secondary !== primary ? [primary, secondary] : [primary],
      primaryColor: primary,
      markings: [],
      shape: build === 'stocky' || build === 'massive' ? 'broad, rounded' : 'rounded',
      texture: 'smooth',
      relativeSize: analysis.bodyProportions?.headToBodyRatio || 0.28,
      crochetNotes: `Work in continuous rounds. Stuff firmly for a rounded head shape.`,
    },
    {
      partName: 'body',
      colors: secondary !== primary ? [primary, secondary] : [primary],
      primaryColor: primary,
      markings: [],
      shape: build,
      texture: 'smooth',
      relativeSize: 1.0,
      crochetNotes: `Create the main body shape. ${build === 'stocky' ? 'Use wider increases for a stocky build.' : build === 'slender' ? 'Keep a slim profile with fewer increases.' : 'Work standard increases for the body.'}`,
    },
    {
      partName: 'ears',
      colors: [primary],
      primaryColor: primary,
      markings: [],
      shape: earShape,
      texture: 'smooth',
      relativeSize: analysis.bodyProportions?.earSize || 0.15,
      crochetNotes: earShape === 'pointy' || (earShape as string) === 'bat'
        ? 'Create pointed triangular ears. Use pipe cleaners to keep upright.'
        : 'Create flat, rounded ear pieces. Leave unstuffed for a natural floppy look.',
    },
    {
      partName: 'tail',
      colors: [primary],
      primaryColor: primary,
      markings: [],
      shape: tailType,
      texture: 'smooth',
      relativeSize: analysis.bodyProportions?.tailLength || 0.15,
      crochetNotes: (tailType as string) === 'docked' || (tailType as string) === 'corkscrew'
        ? 'Very short tail — just a small nub of a few rounds.'
        : `Shape the tail to match a ${tailType} tail type. Stuff lightly.`,
    },
    {
      partName: 'snout',
      colors: [primary],
      primaryColor: primary,
      markings: [],
      shape: snoutLen < 0.25 ? 'short, flat' : 'medium',
      texture: 'smooth',
      relativeSize: snoutLen,
      crochetNotes: snoutLen < 0.25
        ? 'Very short snout — almost flush with the face. Only a few rows needed.'
        : 'Attach centered on the lower half of the head.',
    },
  ];
}

/**
 * Resize an image file to a max dimension, returning base64 + mimeType.
 * This prevents huge phone photos from exceeding API limits.
 */
async function resizeAndConvertToBase64(
  file: File,
  maxDimension: number = 1024
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if needed
      if (width > maxDimension || height > maxDimension) {
        const scale = maxDimension / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG at 85% quality for smaller size
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.split(',')[1];
      resolve({ base64, mimeType: 'image/jpeg' });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for processing'));
    };

    img.src = url;
  });
}

/**
 * Analyze a dog image using Gemini Vision API via /api/analyze route
 * @param imageFile - The image file to analyze
 * @param selectedBreeds - Array of breed names the user selected (provides context to AI)
 * @returns Promise resolving to DogAnalysisResult
 */
export async function analyzeImage(
  imageFile: File,
  selectedBreeds?: string[] | null
): Promise<DogAnalysisResult> {
  // Resize and convert to base64 (prevents oversized payloads)
  const { base64, mimeType } = await resizeAndConvertToBase64(imageFile);

  // Call the API route
  let response: Response;
  try {
    response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64,
        mimeType,
        selectedBreeds: selectedBreeds && selectedBreeds.length > 0 ? selectedBreeds : undefined,
      }),
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (fetchError) {
    throw new Error(
      'Could not reach the analysis server. Please check if the dev server is running.'
    );
  }

  if (!response.ok) {
    let errorMessage = `Analysis failed (status ${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Response wasn't JSON — try text
      try {
        const text = await response.text();
        if (text.length < 200) {
          errorMessage = text;
        }
      } catch {
        // give up, use the default message
      }
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  // Map the API response to our DogAnalysisResult type
  const result: DogAnalysisResult = {
    detectedBreed: data.detectedBreed || 'labrador',
    confidenceScore: data.confidenceScore || 0.8,
    alternativeBreeds: data.alternativeBreeds || [],
    colors: {
      primary: data.colors?.primary || '#8B4513',
      secondary: data.colors?.secondary || null,
      tertiary: data.colors?.tertiary || null,
      accent: data.colors?.accent || '#1A1A1A',
    },
    colorConfidence: data.colorConfidence || 0.8,
    markings: (data.markings || []).map((m: Record<string, unknown>) => ({
      type: m.type || 'spot',
      location: m.location || 'body',
      coverage: m.coverage || 0.2,
      colors: (m.colors as string[]) || [],
    })),
    earShape: data.earShape || 'floppy',
    tailType: data.tailType || 'straight',
    bodyProportions: {
      headToBodyRatio: data.bodyProportions?.headToBodyRatio || 0.28,
      legLength: data.bodyProportions?.legLength || 0.35,
      tailLength: data.bodyProportions?.tailLength || 0.35,
      earSize: data.bodyProportions?.earSize || 0.25,
      snoutLength: data.bodyProportions?.snoutLength || 0.3,
      buildType: data.bodyProportions?.buildType || 'athletic',
    },
    distinctiveFeatures: (data.distinctiveFeatures || []).map(
      (f: Record<string, unknown>) => ({
        name: f.name || 'Unknown',
        location: f.location || 'body',
        description: f.description || '',
        confidence: f.confidence || 0.8,
      })
    ),
    bodyPartAnalysis: (data.bodyPartAnalysis || []).map(
      (bp: Record<string, unknown>): BodyPartAnalysis => ({
        partName: (bp.partName as string) || 'body',
        colors: (bp.colors as string[]) || [],
        primaryColor: (bp.primaryColor as string) || '#8B4513',
        markings: (bp.markings as string[]) || [],
        shape: (bp.shape as string) || '',
        texture: (bp.texture as string) || 'smooth',
        relativeSize: (bp.relativeSize as number) || 0.5,
        crochetNotes: (bp.crochetNotes as string) || '',
      })
    ),
    estimatedAge: data.estimatedAge || 'adult',
    estimatedSize: data.estimatedSize || 'medium',
    photoUrl: '',
    analysisTimestamp: new Date(),
    modelVersion: data.modelVersion || 'gemini-2.0-flash',
  };

  // If the API didn't return bodyPartAnalysis (or returned empty),
  // generate defaults from the detected features so the preview section always shows
  if (!result.bodyPartAnalysis || result.bodyPartAnalysis.length === 0) {
    result.bodyPartAnalysis = generateDefaultBodyPartAnalysis(result);
  }

  return result;
}

/**
 * Generate a default analysis result for a breed (used when skipping photo upload)
 */
export function getDefaultAnalysisForBreed(
  breedId: string
): DogAnalysisResult {
  const breedDefaults: Record<
    string,
    {
      colors: { primary: string; secondary: string | null; accent: string };
      earShape: string;
      tailType: string;
      buildType: string;
    }
  > = {
    labrador: {
      colors: { primary: '#C4A265', secondary: '#E8D5B0', accent: '#1A1A1A' },
      earShape: 'floppy',
      tailType: 'otter',
      buildType: 'athletic',
    },
    'german-shepherd': {
      colors: { primary: '#8B6914', secondary: '#2C1810', accent: '#1A1A1A' },
      earShape: 'pointy',
      tailType: 'straight',
      buildType: 'athletic',
    },
    'golden-retriever': {
      colors: { primary: '#DAA520', secondary: '#F0E68C', accent: '#1A1A1A' },
      earShape: 'floppy',
      tailType: 'plumed',
      buildType: 'athletic',
    },
    'french-bulldog': {
      colors: { primary: '#8B7355', secondary: '#D2B48C', accent: '#1A1A1A' },
      earShape: 'bat',
      tailType: 'corkscrew',
      buildType: 'stocky',
    },
    bulldog: {
      colors: { primary: '#8B5A3C', secondary: '#FFFFFF', accent: '#1A1A1A' },
      earShape: 'rose',
      tailType: 'corkscrew',
      buildType: 'massive',
    },
    poodle: {
      colors: { primary: '#F5DEB3', secondary: '#FFE4B5', accent: '#1A1A1A' },
      earShape: 'floppy',
      tailType: 'plumed',
      buildType: 'slender',
    },
    beagle: {
      colors: { primary: '#FFFFFF', secondary: '#8B4513', accent: '#1A1A1A' },
      earShape: 'floppy',
      tailType: 'flag',
      buildType: 'athletic',
    },
    rottweiler: {
      colors: { primary: '#1A1A1A', secondary: '#CD853F', accent: '#8B4513' },
      earShape: 'floppy',
      tailType: 'docked',
      buildType: 'massive',
    },
    dachshund: {
      colors: { primary: '#8B4513', secondary: '#D2B48C', accent: '#1A1A1A' },
      earShape: 'floppy',
      tailType: 'whip',
      buildType: 'slender',
    },
    corgi: {
      colors: { primary: '#CD853F', secondary: '#FFFFFF', accent: '#1A1A1A' },
      earShape: 'pointy',
      tailType: 'plumed',
      buildType: 'stocky',
    },
  };

  const defaults = breedDefaults[breedId] || breedDefaults['labrador'];

  // Default body part analysis for each breed (provides crochet-specific guidance)
  const bodyPartDefaults: Record<string, BodyPartAnalysis[]> = {
    labrador: [
      { partName: 'head', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'broad, rounded', texture: 'smooth', relativeSize: 0.28, crochetNotes: 'Work in continuous rounds. Stuff firmly for a round, broad head shape characteristic of Labradors.' },
      { partName: 'body', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'athletic, barrel-chested', texture: 'smooth', relativeSize: 0.35, crochetNotes: 'Create a sturdy barrel shape. Labs have a deep chest so add extra rounds in the middle section.' },
      { partName: 'ears', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'floppy, medium triangular', texture: 'smooth', relativeSize: 0.12, crochetNotes: 'Flat triangular pieces, folded slightly at the base. Leave unstuffed for a natural floppy look.' },
      { partName: 'tail', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'otter tail, thick at base', texture: 'smooth', relativeSize: 0.15, crochetNotes: 'Tapers from thick base to rounded tip. Stuff lightly — the classic otter tail should feel thick and rounded.' },
      { partName: 'snout', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'broad, square', texture: 'smooth', relativeSize: 0.1, crochetNotes: 'Broad and boxy shape. Attach centered on the lower half of the head.' },
    ],
    'german-shepherd': [
      { partName: 'head', colors: [defaults.colors.primary, defaults.colors.secondary!], primaryColor: defaults.colors.primary, markings: ['black mask'], shape: 'wedge-shaped, alert', texture: 'smooth', relativeSize: 0.25, crochetNotes: 'Slightly elongated wedge shape. Add black color change rows for the characteristic face mask.' },
      { partName: 'body', colors: [defaults.colors.primary, defaults.colors.secondary!], primaryColor: defaults.colors.secondary!, markings: ['saddle pattern'], shape: 'sloped back, muscular', texture: 'dense', relativeSize: 0.35, crochetNotes: 'Create the iconic saddle marking with a color change on the upper back rows. Slight slope from shoulders to hips.' },
      { partName: 'ears', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'large, erect, triangular', texture: 'smooth', relativeSize: 0.15, crochetNotes: 'Large pointed triangles. Insert wire or pipe cleaner to keep them standing upright.' },
      { partName: 'tail', colors: [defaults.colors.secondary!], primaryColor: defaults.colors.secondary!, markings: [], shape: 'bushy, curved', texture: 'dense', relativeSize: 0.18, crochetNotes: 'Long bushy tail. Work in dark color, stuff moderately with a slight curve.' },
      { partName: 'snout', colors: [defaults.colors.secondary!], primaryColor: defaults.colors.secondary!, markings: ['black nose'], shape: 'long, tapered', texture: 'smooth', relativeSize: 0.12, crochetNotes: 'Elongated cone shape in dark color for the black muzzle.' },
    ],
    'golden-retriever': [
      { partName: 'head', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'broad, friendly', texture: 'fluffy', relativeSize: 0.28, crochetNotes: 'Round, broad head. Use loop stitch or brushed yarn for a fluffy texture around the ears and cheeks.' },
      { partName: 'body', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: ['lighter chest'], shape: 'athletic, well-proportioned', texture: 'feathered', relativeSize: 0.35, crochetNotes: 'Well-proportioned body. Consider adding lighter chest color. Use loop stitch on belly for the feathered look.' },
      { partName: 'ears', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'floppy, feathered', texture: 'wavy', relativeSize: 0.13, crochetNotes: 'Medium floppy ears. Add loop stitches along edges for the feathered appearance.' },
      { partName: 'tail', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'plumed, flowing', texture: 'feathered', relativeSize: 0.18, crochetNotes: 'Long plumed tail. Use loop stitch for feathering. Stuff lightly and curve upward.' },
      { partName: 'snout', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'medium, squared', texture: 'smooth', relativeSize: 0.1, crochetNotes: 'Medium-length square snout. Slightly lighter color than the body if desired.' },
    ],
    'french-bulldog': [
      { partName: 'head', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'large, square, flat', texture: 'smooth', relativeSize: 0.35, crochetNotes: 'Extra-large and boxy compared to body. Stuff very firmly. The flat face is the key feature.' },
      { partName: 'body', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'compact, muscular, barrel', texture: 'smooth', relativeSize: 0.3, crochetNotes: 'Short and stocky barrel shape. Fewer rows than other breeds but wider circumference.' },
      { partName: 'ears', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'bat ears, large, erect', texture: 'smooth', relativeSize: 0.15, crochetNotes: 'Signature bat ears — large, rounded tops, wide base. Must stand upright; use pipe cleaners if needed.' },
      { partName: 'tail', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'very short, screwed', texture: 'smooth', relativeSize: 0.05, crochetNotes: 'Tiny corkscrew nub. Just a few rounds, barely visible. Can be a small spiral coil.' },
      { partName: 'snout', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: ['nose wrinkles'], shape: 'extremely short, flat', texture: 'smooth', relativeSize: 0.08, crochetNotes: 'Very flat, minimal protrusion. Almost flush with the face. Add embroidered wrinkle lines above the nose.' },
    ],
    beagle: [
      { partName: 'head', colors: ['#FFFFFF', '#8B4513'], primaryColor: '#FFFFFF', markings: ['tan patches'], shape: 'rounded dome', texture: 'smooth', relativeSize: 0.25, crochetNotes: 'Rounded dome shape. Work color changes for the classic tricolor pattern: white base with brown patches on top.' },
      { partName: 'body', colors: ['#FFFFFF', '#8B4513', '#1A1A1A'], primaryColor: '#FFFFFF', markings: ['tricolor saddle'], shape: 'compact, sturdy', texture: 'smooth', relativeSize: 0.32, crochetNotes: 'Sturdy build. White belly, brown/black saddle on back. Use intarsia or separate color sections.' },
      { partName: 'ears', colors: ['#8B4513'], primaryColor: '#8B4513', markings: [], shape: 'very long, floppy, rounded', texture: 'soft', relativeSize: 0.15, crochetNotes: 'Signature long floppy ears in brown. Make them extra long — they should reach nearly to the nose tip. Leave unstuffed.' },
      { partName: 'tail', colors: ['#FFFFFF'], primaryColor: '#FFFFFF', markings: ['white tip'], shape: 'flag tail, upright', texture: 'smooth', relativeSize: 0.12, crochetNotes: 'Carried upright like a flag. White tip is essential. Stuff with pipe cleaner to keep upright.' },
      { partName: 'snout', colors: ['#FFFFFF', '#8B4513'], primaryColor: '#FFFFFF', markings: ['tan muzzle'], shape: 'square, medium', texture: 'smooth', relativeSize: 0.1, crochetNotes: 'Medium square muzzle. White with brown patch on top blending into the head color.' },
    ],
    bulldog: [
      { partName: 'head', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: ['wrinkles'], shape: 'massive, flat, wrinkled', texture: 'wrinkled', relativeSize: 0.35, crochetNotes: 'Very large, wide, and flat. Add embroidered or crocheted wrinkle details across the forehead and cheeks.' },
      { partName: 'body', colors: [defaults.colors.primary, defaults.colors.secondary!], primaryColor: defaults.colors.primary, markings: ['white chest'], shape: 'wide, low, heavy', texture: 'smooth', relativeSize: 0.35, crochetNotes: 'Low and wide barrel shape. White color change for the chest area. Very stocky proportions.' },
      { partName: 'ears', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'small, rose-shaped', texture: 'smooth', relativeSize: 0.08, crochetNotes: 'Small rose ears that fold back. Make them small relative to the head — much smaller than you might think.' },
      { partName: 'tail', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'short, screwed', texture: 'smooth', relativeSize: 0.05, crochetNotes: 'Very short corkscrew tail. Just a tiny spiral nub.' },
      { partName: 'snout', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: ['pushed in'], shape: 'extremely flat, wide', texture: 'wrinkled', relativeSize: 0.1, crochetNotes: 'Wide and very flat. Almost no protrusion. Add an embroidered underbite detail.' },
    ],
    poodle: [
      { partName: 'head', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'rounded, elegant', texture: 'curly', relativeSize: 0.25, crochetNotes: 'Rounded elegant shape. Use loop stitch or bobble stitch to create the iconic curly poodle texture.' },
      { partName: 'body', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'slender, well-proportioned', texture: 'curly', relativeSize: 0.3, crochetNotes: 'Slim and elegant body. Use loop stitch throughout for the curly coat texture.' },
      { partName: 'ears', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'long, floppy, heavily feathered', texture: 'very curly', relativeSize: 0.14, crochetNotes: 'Long floppy ears with lots of loop stitch for the fluffy poodle ear look.' },
      { partName: 'tail', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'pom-pom tipped', texture: 'curly', relativeSize: 0.12, crochetNotes: 'Slim tail with a fluffy pom-pom tip. Use loop stitch only at the end.' },
      { partName: 'snout', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'long, narrow', texture: 'smooth', relativeSize: 0.12, crochetNotes: 'Long, refined snout. Keep it smooth (no loop stitch) to contrast with the curly body.' },
    ],
    rottweiler: [
      { partName: 'head', colors: [defaults.colors.primary, defaults.colors.secondary!], primaryColor: defaults.colors.primary, markings: ['tan eyebrows'], shape: 'broad, blocky', texture: 'smooth', relativeSize: 0.28, crochetNotes: 'Large, blocky head in black. Add tan dots above the eyes for the distinctive eyebrow markings.' },
      { partName: 'body', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: ['tan chest patch'], shape: 'powerful, muscular', texture: 'smooth', relativeSize: 0.35, crochetNotes: 'Broad, muscular body in black. Add tan color change for the chest marking.' },
      { partName: 'ears', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'medium, triangular, pendant', texture: 'smooth', relativeSize: 0.1, crochetNotes: 'Medium triangular ears that hang down close to the head. All black.' },
      { partName: 'tail', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'docked, very short', texture: 'smooth', relativeSize: 0.04, crochetNotes: 'Traditionally docked — make it just a small nub. A few rounds only.' },
      { partName: 'snout', colors: [defaults.colors.primary, defaults.colors.secondary!], primaryColor: defaults.colors.primary, markings: ['tan muzzle'], shape: 'medium, strong', texture: 'smooth', relativeSize: 0.1, crochetNotes: 'Medium-length strong snout. Add tan color on the sides for the muzzle markings.' },
    ],
    dachshund: [
      { partName: 'head', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'elongated, refined', texture: 'smooth', relativeSize: 0.2, crochetNotes: 'Elongated, narrow head tapering toward the nose. More oval than round.' },
      { partName: 'body', colors: [defaults.colors.primary, defaults.colors.secondary!], primaryColor: defaults.colors.primary, markings: ['lighter belly'], shape: 'very long, low', texture: 'smooth', relativeSize: 0.4, crochetNotes: 'The signature sausage shape! Extra long body — about twice as long as other breeds. Work many more rounds than usual.' },
      { partName: 'ears', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'long, floppy, rounded', texture: 'smooth', relativeSize: 0.12, crochetNotes: 'Long floppy ears with rounded tips. Should reach about midway down the body.' },
      { partName: 'tail', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'long, tapered, whip-like', texture: 'smooth', relativeSize: 0.14, crochetNotes: 'Long tapered tail. Stuff lightly with a slight upward curve.' },
      { partName: 'snout', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'long, narrow', texture: 'smooth', relativeSize: 0.12, crochetNotes: 'Long pointed snout — proportionally longer than most breeds.' },
    ],
    corgi: [
      { partName: 'head', colors: [defaults.colors.primary, defaults.colors.secondary!], primaryColor: defaults.colors.primary, markings: ['white blaze'], shape: 'fox-like, alert', texture: 'smooth', relativeSize: 0.25, crochetNotes: 'Fox-like wedge shape. Add white color change for the blaze marking down the face center.' },
      { partName: 'body', colors: [defaults.colors.primary, defaults.colors.secondary!], primaryColor: defaults.colors.primary, markings: ['white belly'], shape: 'long, low, sturdy', texture: 'dense', relativeSize: 0.35, crochetNotes: 'Long and low body. White belly with brown/sable on top. Wider than tall.' },
      { partName: 'ears', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'large, erect, rounded tips', texture: 'smooth', relativeSize: 0.18, crochetNotes: 'Oversized pointed ears with rounded tips — the corgi trademark! Must stand upright. Use pipe cleaners.' },
      { partName: 'tail', colors: [defaults.colors.primary], primaryColor: defaults.colors.primary, markings: [], shape: 'fluffy, medium (or docked)', texture: 'fluffy', relativeSize: 0.1, crochetNotes: 'Pembrokes have a tiny docked tail nub. Cardigans have a fluffy fox-like tail.' },
      { partName: 'snout', colors: [defaults.colors.primary, defaults.colors.secondary!], primaryColor: defaults.colors.primary, markings: ['white muzzle'], shape: 'medium, pointed', texture: 'smooth', relativeSize: 0.1, crochetNotes: 'Medium pointed snout with white color change on the lower portion.' },
    ],
  };

  const bodyParts = bodyPartDefaults[breedId] || bodyPartDefaults['labrador'];

  return {
    detectedBreed: breedId as DogAnalysisResult['detectedBreed'],
    confidenceScore: 1.0,
    alternativeBreeds: [],
    colors: {
      primary: defaults.colors.primary,
      secondary: defaults.colors.secondary || undefined,
      accent: defaults.colors.accent,
    },
    colorConfidence: 0.5,
    markings: [],
    earShape: defaults.earShape as DogAnalysisResult['earShape'],
    tailType: defaults.tailType as DogAnalysisResult['tailType'],
    bodyProportions: {
      headToBodyRatio: 0.28,
      legLength: 0.35,
      tailLength: 0.35,
      earSize: 0.25,
      snoutLength: 0.3,
      buildType: defaults.buildType as
        | 'slender'
        | 'athletic'
        | 'stocky'
        | 'massive',
    },
    distinctiveFeatures: [],
    bodyPartAnalysis: bodyParts,
    estimatedAge: 'adult',
    estimatedSize: 'medium',
    photoUrl: '',
    analysisTimestamp: new Date(),
    modelVersion: 'default-preset',
  };
}
