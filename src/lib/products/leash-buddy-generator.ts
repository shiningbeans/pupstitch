/**
 * LeashBuddy Product Spec Generator
 * Converts AI dog analysis into complete manufacturing specifications
 * for the LeashBuddy poop bag holder / treat pouch
 */

import { DogAnalysisResult, DollSize } from '@/types';
import {
  LeashBuddyProductSpec,
  LeashBuddySize,
  FabricColorSpec,
  BOMItem,
  PRODUCT_DIMENSIONS,
} from '@/types/product-types';
import {
  generateAllEmbroiderySpecs,
  mapEarShapeToStyle,
  hexToColorName,
} from './embroidery-mapper';

/**
 * Map DollSize to LeashBuddySize
 */
function mapSize(dollSize: DollSize): LeashBuddySize {
  switch (dollSize) {
    case 'small': return 'small';
    case 'large': return 'large';
    default: return 'medium';
  }
}

/**
 * Generate fabric color assignments from AI analysis
 */
function generateFabricColors(analysis: DogAnalysisResult): FabricColorSpec[] {
  const primary = analysis.colors.primary || '#D4A574';
  const secondary = analysis.colors.secondary || analysis.colors.primary || '#C4956A';
  const tertiary = analysis.colors.tertiary || '#F5E6D3';
  const accent = analysis.colors.accent || secondary;

  const primaryName = hexToColorName(primary);
  const secondaryName = hexToColorName(secondary);

  const fabrics: FabricColorSpec[] = [
    // Main body panels
    {
      part: 'main-body',
      partLabel: 'Main Body',
      hex: primary,
      colorName: primaryName,
      material: 'canvas',
      notes: 'Primary body fabric — durable canvas or nylon',
    },
    {
      part: 'front-flap',
      partLabel: 'Front Flap (Face Area)',
      hex: primary,
      colorName: primaryName,
      material: 'canvas',
      notes: 'Flap with embroidered face — same as body',
    },
    {
      part: 'back-panel',
      partLabel: 'Back Panel',
      hex: primary,
      colorName: primaryName,
      material: 'canvas',
      notes: 'Back panel with logo embroidery and belt loops',
    },
    // Interior
    {
      part: 'interior-lining',
      partLabel: 'Interior Lining',
      hex: tertiary,
      colorName: hexToColorName(tertiary),
      material: 'polyester',
      notes: 'Lightweight polyester lining, easy to clean',
    },
    // Ears
    {
      part: 'ear-outer-left',
      partLabel: 'Left Ear (Outer)',
      hex: secondary,
      colorName: secondaryName,
      material: 'canvas',
      notes: '3D double-layer ear — outer layer',
    },
    {
      part: 'ear-outer-right',
      partLabel: 'Right Ear (Outer)',
      hex: secondary,
      colorName: secondaryName,
      material: 'canvas',
    },
    {
      part: 'ear-inner-left',
      partLabel: 'Left Ear (Inner)',
      hex: tertiary,
      colorName: hexToColorName(tertiary),
      material: 'fleece',
      notes: 'Soft fleece inner ear for contrast',
    },
    {
      part: 'ear-inner-right',
      partLabel: 'Right Ear (Inner)',
      hex: tertiary,
      colorName: hexToColorName(tertiary),
      material: 'fleece',
    },
    // Binding & accents
    {
      part: 'binding-edge',
      partLabel: 'Binding / Edge Tape',
      hex: accent,
      colorName: hexToColorName(accent),
      material: 'polyester',
      notes: 'Contrast binding around flap and edges',
    },
    // Bottom compartment
    {
      part: 'bottom-compartment',
      partLabel: 'Bottom Compartment (Poop Bags)',
      hex: primary,
      colorName: primaryName,
      material: 'nylon',
      notes: 'Zippered compartment — water-resistant nylon',
    },
    // Paw accents
    {
      part: 'paw-accent-left',
      partLabel: 'Left Paw Accent',
      hex: secondary,
      colorName: secondaryName,
      material: 'canvas',
      notes: 'Background for paw embroidery',
    },
    {
      part: 'paw-accent-right',
      partLabel: 'Right Paw Accent',
      hex: secondary,
      colorName: secondaryName,
      material: 'canvas',
    },
  ];

  return fabrics;
}

/**
 * Generate Bill of Materials
 */
function generateBOM(
  size: LeashBuddySize,
  fabricColors: FabricColorSpec[],
  embroiderySpecs: import('@/types/product-types').EmbroiderySpec[]
): BOMItem[] {
  const dims = PRODUCT_DIMENSIONS[size];
  const items: BOMItem[] = [];

  // Fabrics
  const uniqueMaterials = new Map<string, FabricColorSpec[]>();
  for (const fc of fabricColors) {
    const key = `${fc.material}-${fc.hex}`;
    if (!uniqueMaterials.has(key)) uniqueMaterials.set(key, []);
    uniqueMaterials.get(key)!.push(fc);
  }

  for (const [, fabrics] of uniqueMaterials) {
    const f = fabrics[0];
    items.push({
      name: `${f.material.charAt(0).toUpperCase() + f.material.slice(1)} Fabric — ${f.colorName}`,
      category: 'fabric',
      quantity: Math.ceil((dims.heightCm * dims.widthCm * fabrics.length) / 100 * 1.3), // +30% waste
      unit: 'sq cm',
      material: f.material,
      colorHex: f.hex,
      specification: `${f.colorName} ${f.material}`,
      estimatedCostUSD: 0.50,
    });
  }

  // Hardware
  items.push({
    name: 'Spring Hook Carabiner with Strap',
    category: 'hardware',
    quantity: 1,
    unit: 'piece',
    material: 'zinc alloy',
    specification: 'Swivel clip, 3.5cm width, silver/gunmetal finish',
    estimatedCostUSD: 0.35,
  });

  items.push({
    name: 'Nylon Coil Zipper — Bottom Compartment',
    category: 'hardware',
    quantity: 1,
    unit: 'piece',
    specification: `#3 nylon coil, ${dims.widthCm + 2}cm length`,
    estimatedCostUSD: 0.15,
  });

  items.push({
    name: 'Snap Button — Main Flap',
    category: 'hardware',
    quantity: 1,
    unit: 'set',
    specification: '12mm metal snap, 4-piece set (cap, socket, stud, post)',
    estimatedCostUSD: 0.10,
  });

  items.push({
    name: 'D-Ring — Belt Loop Attachment',
    category: 'hardware',
    quantity: 2,
    unit: 'piece',
    material: 'zinc alloy',
    specification: '15mm D-ring for belt loop option',
    estimatedCostUSD: 0.08,
  });

  // Rubber grommet for bag dispensing
  items.push({
    name: 'Rubber Grommet — Bag Dispensing Hole',
    category: 'hardware',
    quantity: 1,
    unit: 'piece',
    material: 'rubber',
    specification: '15mm inner diameter, bottom panel',
    estimatedCostUSD: 0.05,
  });

  // Thread
  const uniqueThreadColors = new Map<string, string>();
  for (const spec of embroiderySpecs) {
    for (const thread of spec.threadColors) {
      uniqueThreadColors.set(thread.hex, thread.name);
    }
  }

  for (const [hex, name] of uniqueThreadColors) {
    items.push({
      name: `Embroidery Thread — ${name}`,
      category: 'thread',
      quantity: 1,
      unit: 'spool',
      colorHex: hex,
      specification: '40-weight polyester embroidery thread',
      estimatedCostUSD: 0.20,
    });
  }

  // Sewing thread
  items.push({
    name: 'Polyester Sewing Thread — Construction',
    category: 'thread',
    quantity: 1,
    unit: 'spool',
    specification: 'Heavy-duty polyester, color-matched to primary fabric',
    estimatedCostUSD: 0.15,
  });

  // Notions
  items.push({
    name: 'Lightweight Interfacing',
    category: 'notions',
    quantity: Math.ceil(dims.heightCm * dims.widthCm * 0.5),
    unit: 'sq cm',
    specification: 'Fusible, medium weight — for ear and flap structure',
    estimatedCostUSD: 0.10,
  });

  items.push({
    name: 'Binding Tape',
    category: 'notions',
    quantity: Math.ceil((dims.heightCm + dims.widthCm) * 2.5),
    unit: 'cm',
    specification: '12mm bias binding tape, matching edge color',
    estimatedCostUSD: 0.08,
  });

  // Packaging
  items.push({
    name: 'Poly Bag — Individual Product Packaging',
    category: 'packaging',
    quantity: 1,
    unit: 'piece',
    specification: 'Clear poly bag with hang header',
    estimatedCostUSD: 0.05,
  });

  return items;
}

/**
 * Generate assembly notes
 */
function generateAssemblyNotes(earStyle: import('@/types/product-types').ProductEarStyle): string[] {
  return [
    '1. Cut all fabric panels according to pattern templates for selected size.',
    '2. Apply fusible interfacing to front flap and ear panels.',
    `3. Construct 3D ${earStyle} ears: sew outer and inner layers RST, turn, press, topstitch edges.`,
    '4. Complete all embroidery BEFORE assembly:',
    '   a. Embroider face design on front flap panel.',
    '   b. Embroider paw prints on front body lower section.',
    '   c. Embroider logo on back panel.',
    '5. Install snap button on front flap (cap on flap, socket on body).',
    '6. Assemble bottom compartment: attach zipper, install rubber grommet for bag dispensing.',
    '7. Join front flap to main body panel, sandwiching ears at top corners.',
    '8. Apply binding tape around all edges.',
    '9. Attach belt loop D-rings to back panel.',
    '10. Attach carabiner strap to top center.',
    '11. Quality check: test snap closure, zipper function, bag dispensing hole, all embroidery clarity.',
    '12. Pack in individual poly bag with hang header.',
  ];
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

/**
 * Generate a complete LeashBuddy product specification from dog analysis
 */
export function generateLeashBuddySpec(
  analysis: DogAnalysisResult,
  size: DollSize = 'medium',
  dogName?: string
): LeashBuddyProductSpec {
  const productSize = mapSize(size);
  const dimensions = PRODUCT_DIMENSIONS[productSize];
  const earStyle = mapEarShapeToStyle(analysis.earShape);
  const breedName = analysis.detectedBreed.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Generate all sub-specs
  const embroiderySpecs = generateAllEmbroiderySpecs(analysis);
  const fabricColors = generateFabricColors(analysis);
  const manufacturingBOM = generateBOM(productSize, fabricColors, embroiderySpecs);
  const assemblyNotes = generateAssemblyNotes(earStyle);

  // Build product name
  const namePrefix = dogName ? `${dogName}'s` : '';
  const productName = namePrefix
    ? `${namePrefix} ${breedName} LeashBuddy`
    : `${breedName} LeashBuddy`;

  return {
    productName,
    breedName,
    dogName,
    productSize,
    dimensions,
    earStyle,
    embroiderySpecs,
    fabricColors,
    manufacturingBOM,
    assemblyNotes,
    generatedAt: new Date(),
    specVersion: '1.0.0',
  };
}
