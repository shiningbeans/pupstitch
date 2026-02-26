/**
 * Embroidery Mapper
 * Converts AI dog analysis into embroidery design specifications
 * for the LeashBuddy poop bag holder manufacturing
 */

import { DogAnalysisResult, EarShape } from '@/types';
import { EmbroiderySpec, EmbroideryLocation } from '@/types/product-types';

/**
 * Color name lookup from hex (approximate)
 */
function hexToColorName(hex: string): string {
  const h = hex.replace('#', '').toLowerCase();
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  if (brightness < 40) return 'Black';
  if (brightness > 230 && r > 220 && g > 220 && b > 220) return 'White';
  if (brightness > 200) return 'Cream';

  if (r > 180 && g > 140 && b < 100) return 'Golden';
  if (r > 150 && g > 100 && b < 80) return 'Tan';
  if (r > 120 && g < 80 && b < 60) return 'Chocolate Brown';
  if (r > 80 && g < 50 && b < 40) return 'Dark Brown';
  if (r > 160 && g > 130 && b > 100) return 'Beige';
  if (r > 100 && g > 80 && b > 60) return 'Light Brown';
  if (r > 60 && g > 60 && b > 60 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) return 'Gray';
  if (r > 180 && g < 100 && b < 80) return 'Rust';
  if (r > 200 && g > 160 && b > 120) return 'Sandy';

  return 'Custom';
}

/**
 * Generate face embroidery spec based on breed analysis
 */
function generateFaceEmbroidery(analysis: DogAnalysisResult): EmbroiderySpec {
  const breed = analysis.detectedBreed.replace(/-/g, ' ');
  const primaryColor = analysis.colors.primary || '#000000';
  const secondaryColor = analysis.colors.secondary || '#333333';
  const accentColor = analysis.colors.accent || '#000000';

  // Eye style based on breed
  const eyeColors: EmbroiderySpec['threadColors'] = [
    { hex: '#000000', name: 'Black', usage: 'eyes (solid circles, 4mm diameter)' },
    { hex: '#FFFFFF', name: 'White', usage: 'eye highlights (small dot, upper-right)' },
  ];

  // Nose
  const noseColor = analysis.bodyProportions?.buildType === 'stocky'
    ? '#1a1a1a' : '#333333';
  eyeColors.push({
    hex: noseColor,
    name: noseColor === '#1a1a1a' ? 'Black' : 'Dark Gray',
    usage: 'nose (triangular, centered below eyes)',
  });

  // Mouth / smile line
  eyeColors.push({
    hex: '#4a4a4a',
    name: 'Charcoal',
    usage: 'smile line (curved line below nose)',
  });

  // Snout area color (lighter than face for most breeds)
  if (secondaryColor && secondaryColor !== primaryColor) {
    eyeColors.push({
      hex: secondaryColor,
      name: hexToColorName(secondaryColor),
      usage: 'snout/muzzle area fill',
    });
  }

  // Breed-specific markings on face
  const markings = analysis.markings?.filter(m =>
    m.location === 'head' || m.location === 'snout'
  ) || [];

  let designDesc = `Embroidered ${breed} face design. `;
  designDesc += 'Two round black eyes (4mm, 8mm apart). ';
  designDesc += 'Triangular nose centered 5mm below eye line. ';
  designDesc += 'Curved smile line extending 3mm from nose sides. ';

  if (markings.length > 0) {
    const markingDescs = markings.map(m =>
      `${m.type} marking in ${m.colors.map(hexToColorName).join('/')}`
    );
    designDesc += `Facial markings: ${markingDescs.join('; ')}. `;
  }

  return {
    location: 'front-flap',
    designDescription: designDesc,
    threadColors: eyeColors,
    estimatedStitchCount: 2500,
    dimensions: { widthMm: 40, heightMm: 30 },
    notes: `Reference breed: ${breed}. Embroidery should be centered on flap with 3mm margins.`,
  };
}

/**
 * Generate paw print embroidery specs
 */
function generatePawEmbroidery(
  side: 'left' | 'right',
  primaryColor: string
): EmbroiderySpec {
  const location: EmbroideryLocation = side === 'left' ? 'paw-left' : 'paw-right';
  const pawColor = primaryColor || '#8B4513';

  // Paw prints are darker shade of primary
  const r = parseInt(pawColor.replace('#', '').slice(0, 2), 16);
  const g = parseInt(pawColor.replace('#', '').slice(2, 4), 16);
  const b = parseInt(pawColor.replace('#', '').slice(4, 6), 16);
  const darkerHex = '#' + [
    Math.max(0, r - 40).toString(16).padStart(2, '0'),
    Math.max(0, g - 40).toString(16).padStart(2, '0'),
    Math.max(0, b - 40).toString(16).padStart(2, '0'),
  ].join('');

  return {
    location,
    designDescription: `Paw print embroidery (${side}). One large pad (oval, 8x6mm) with four small toe pads (3mm circles) arranged above.`,
    threadColors: [
      { hex: darkerHex, name: hexToColorName(darkerHex), usage: 'paw pad and toe pads (satin stitch fill)' },
    ],
    estimatedStitchCount: 400,
    dimensions: { widthMm: 12, heightMm: 15 },
  };
}

/**
 * Generate back logo embroidery spec
 */
function generateLogoEmbroidery(): EmbroiderySpec {
  return {
    location: 'back-logo',
    designDescription: 'LeashBuddy logo silhouette — small sitting dog outline. Single-color outline stitch, no fill.',
    threadColors: [
      { hex: '#6B7280', name: 'Medium Gray', usage: 'logo outline (running stitch or backstitch)' },
    ],
    estimatedStitchCount: 300,
    dimensions: { widthMm: 15, heightMm: 18 },
    notes: 'Centered on back panel, 10mm from top edge.',
  };
}

/**
 * Generate ear patch embroidery if the dog has distinctive ear markings
 */
function generateEarPatchEmbroidery(
  analysis: DogAnalysisResult,
  side: 'left' | 'right'
): EmbroiderySpec | null {
  const earMarkings = analysis.markings?.filter(m => m.location === 'ear') || [];
  if (earMarkings.length === 0) return null;

  const marking = earMarkings[0];
  const location: EmbroideryLocation = side === 'left' ? 'ear-patch-left' : 'ear-patch-right';

  return {
    location,
    designDescription: `Ear ${marking.type} marking on ${side} ear. ${marking.type === 'spot' ? 'Filled circle' : 'Filled area'} covering approximately ${Math.round(marking.coverage * 100)}% of ear surface.`,
    threadColors: marking.colors.map((c, i) => ({
      hex: c,
      name: hexToColorName(c),
      usage: i === 0 ? 'marking fill' : 'marking accent',
    })),
    estimatedStitchCount: 600,
    dimensions: { widthMm: 20, heightMm: 15 },
  };
}

/**
 * Map AI ear shape to product ear style
 */
export function mapEarShapeToStyle(earShape: EarShape): import('@/types/product-types').ProductEarStyle {
  switch (earShape) {
    case 'floppy':
    case 'droopy':
    case 'pendant':
      return 'floppy';
    case 'pointy':
      return 'pointy';
    case 'button':
    case 'flat':
      return 'button';
    case 'rose':
      return 'rose';
    default:
      return 'floppy';
  }
}

/**
 * Generate all embroidery specs from dog analysis
 */
export function generateAllEmbroiderySpecs(
  analysis: DogAnalysisResult
): EmbroiderySpec[] {
  const specs: EmbroiderySpec[] = [];

  // 1. Face embroidery (always)
  specs.push(generateFaceEmbroidery(analysis));

  // 2. Paw prints (always)
  specs.push(generatePawEmbroidery('left', analysis.colors.primary));
  specs.push(generatePawEmbroidery('right', analysis.colors.primary));

  // 3. Back logo (always)
  specs.push(generateLogoEmbroidery());

  // 4. Ear patches (only if markings detected)
  const leftEar = generateEarPatchEmbroidery(analysis, 'left');
  if (leftEar) specs.push(leftEar);
  const rightEar = generateEarPatchEmbroidery(analysis, 'right');
  if (rightEar) specs.push(rightEar);

  return specs;
}

export { hexToColorName };
