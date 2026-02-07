import {
  DogAnalysisResult,
  BreedPreset,
  CustomPattern,
  GeneratedPattern,
  PatternSection,
  StitchInstruction,
  PatternMaterials,
  YarnInfo,
  PatternCustomizations,
  BodyPartName,
  BodyPartAnalysis,
  StitchType,
} from '@/types';

/**
 * JSON format for a row from preset file
 */
interface JsonRow {
  rowNumber: number;
  instructions: string;
  stitchCount: number;
  colorKey?: string;
}

/**
 * JSON format for proportions in preset file
 */
interface JsonProportions {
  widthModifier?: number;
  lengthModifier?: number;
  widthRatio?: number;
  heightRatio?: number;
  depthRatio?: number;
}

/**
 * JSON format for body part from preset file
 */
interface JsonBodyPart {
  name: BodyPartName;
  quantity: number;
  rows: JsonRow[];
  proportions: JsonProportions;
  assemblyNotes?: string | string[];
  colorZones?: Array<{
    id: string;
    startRow: number;
    endRow: number;
    colorKey: string;
    description: string;
  }>;
}

// ============================================================================
// REALISTIC YARDAGE TABLES
// ============================================================================
// Based on real amigurumi patterns using worsted weight yarn + 3.5-4mm hook.
// Values are in yards per piece (multiply by quantity for total).

const YARDAGE_BY_SIZE: Record<string, Record<string, number>> = {
  small: {
    head: 18,
    body: 22,
    frontLeg: 8,
    backLeg: 8,
    ear: 5,
    tail: 6,
    snout: 5,
    nose: 2,
    eyePatch: 3,
  },
  medium: {
    head: 40,
    body: 50,
    frontLeg: 18,
    backLeg: 18,
    ear: 10,
    tail: 12,
    snout: 10,
    nose: 4,
    eyePatch: 5,
  },
  large: {
    head: 65,
    body: 80,
    frontLeg: 30,
    backLeg: 30,
    ear: 18,
    tail: 20,
    snout: 15,
    nose: 6,
    eyePatch: 8,
  },
};

// Stuffing amounts in ounces by size
const STUFFING_BY_SIZE: Record<string, number> = {
  small: 1.5,
  medium: 4,
  large: 8,
};

// Safety eyes sizing in mm by size
const SAFETY_EYES_BY_SIZE: Record<string, string> = {
  small: '6-8mm',
  medium: '9-12mm',
  large: '12-15mm',
};

// Finished height by size
const HEIGHT_BY_SIZE: Record<string, string> = {
  small: '~4 inches (10 cm)',
  medium: '~8 inches (20 cm)',
  large: '~12 inches (30 cm)',
};

// Stuffing level per body part
const STUFFING_LEVEL: Record<string, string> = {
  head: 'firmly',
  body: 'firmly',
  frontLeg: 'moderately',
  backLeg: 'moderately',
  ear: 'lightly (or leave flat)',
  tail: 'lightly',
  snout: 'moderately',
  nose: 'very lightly',
  eyePatch: 'do not stuff',
};

/**
 * Determine size string from sizeMultiplier.
 */
function getSizeKey(multiplier: number): string {
  if (multiplier <= 0.85) return 'small';
  if (multiplier >= 1.3) return 'large';
  return 'medium';
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

/**
 * Generate a complete custom crochet pattern from analysis results and breed preset
 */
export function generatePattern(
  analysis: DogAnalysisResult,
  preset: BreedPreset,
  customizations?: Partial<PatternCustomizations>
): CustomPattern {
  const mergedCustomizations: PatternCustomizations = {
    colorAssignments: [],
    toggledFeatures: {},
    proportionAdjustments: {},
    difficultyLevel: 'standard',
    sizeMultiplier: 1.0,
    ...customizations,
  };

  // Initialize color assignments from analysis
  if (mergedCustomizations.colorAssignments.length === 0) {
    mergedCustomizations.colorAssignments = buildColorAssignments(analysis);
  }

  const sizeKey = getSizeKey(mergedCustomizations.sizeMultiplier);

  // Generate the pattern sections
  const generatedPattern = generatePatternSections(
    preset,
    analysis,
    mergedCustomizations,
    sizeKey
  );

  // Generate materials list
  const materials = generateMaterialsList(
    preset,
    mergedCustomizations,
    sizeKey
  );

  // Ensure bodyPartAnalysis always exists
  if (!analysis.bodyPartAnalysis || analysis.bodyPartAnalysis.length === 0) {
    analysis.bodyPartAnalysis = generateFallbackBodyPartAnalysis(analysis);
  }

  const displayBreed = formatBreedDisplay(analysis.detectedBreed);

  const customPattern: CustomPattern = {
    id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: 'current-user',
    name: `${displayBreed} Amigurumi`,
    description: `Custom ${displayBreed} crochet pattern generated from photo`,
    dogPhotoUrl: analysis.photoUrl,
    breedId: analysis.detectedBreed,
    analysisResult: analysis,
    customizations: mergedCustomizations,
    generatedPattern,
    materials,
    exportFormats: ['pdf', 'txt', 'markdown'],
    createdAt: new Date(),
    updatedAt: new Date(),
    visibility: 'private',
  };

  return customPattern;
}

// ============================================================================
// HEX → HUMAN-READABLE COLOR NAME
// ============================================================================

/**
 * Convert a hex color code to a human-readable yarn color name.
 * Covers the most common dog coat / yarn colors.
 */
function hexToColorName(hex: string): string {
  // Normalize
  const h = hex.replace('#', '').toLowerCase();
  if (h.length !== 6) return hex;

  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);

  const brightness = (r + g + b) / 3;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;

  // Near-black
  if (brightness < 30) return 'Black';
  // Near-white
  if (brightness > 230 && saturation < 0.1) return 'White';
  // Grays
  if (saturation < 0.12) {
    if (brightness < 80) return 'Charcoal';
    if (brightness < 140) return 'Gray';
    if (brightness < 200) return 'Light Gray';
    return 'Off-White';
  }

  // Compute hue
  let hue = 0;
  if (max === min) {
    hue = 0;
  } else if (max === r) {
    hue = 60 * (((g - b) / (max - min)) % 6);
  } else if (max === g) {
    hue = 60 * ((b - r) / (max - min) + 2);
  } else {
    hue = 60 * ((r - g) / (max - min) + 4);
  }
  if (hue < 0) hue += 360;

  // Warm browns / tans / golds (most common for dog yarn)
  if (hue >= 15 && hue <= 50) {
    if (brightness < 60) return 'Dark Brown';
    if (brightness < 100) return 'Brown';
    if (brightness < 140) return 'Warm Brown';
    if (brightness < 180) return 'Tan';
    return 'Golden';
  }

  // Orange / rust
  if (hue >= 10 && hue < 15) {
    if (brightness < 100) return 'Rust';
    return 'Orange';
  }
  if (hue >= 50 && hue < 70) {
    if (brightness < 120) return 'Olive';
    return 'Yellow';
  }

  // Reds / maroons
  if (hue < 10 || hue >= 340) {
    if (brightness < 80) return 'Maroon';
    if (brightness < 140) return 'Dark Red';
    return 'Red';
  }

  // Greens
  if (hue >= 70 && hue < 170) return 'Green';
  // Blues
  if (hue >= 170 && hue < 260) return 'Blue';
  // Purples
  if (hue >= 260 && hue < 300) return 'Purple';
  // Pinks
  if (hue >= 300 && hue < 340) return 'Pink';

  return 'Medium';
}

// ============================================================================
// COLOR ASSIGNMENT
// ============================================================================

/**
 * Map preset body part names → AI analysis part names
 */
const PRESET_TO_AI_PART: Record<string, string> = {
  head: 'head',
  body: 'body',
  frontLeg: 'legs',
  backLeg: 'legs',
  ear: 'ears',
  tail: 'tail',
  snout: 'snout',
  nose: 'nose',
  eyePatch: 'head',
};

function buildColorAssignments(
  analysis: DogAnalysisResult
): PatternCustomizations['colorAssignments'] {
  const primaryName = hexToColorName(analysis.colors.primary);
  const assignments: PatternCustomizations['colorAssignments'] = [
    {
      colorKey: 'primary',
      hexCode: analysis.colors.primary,
      yarnName: primaryName,
    },
  ];

  if (analysis.colors.secondary) {
    const secName = hexToColorName(analysis.colors.secondary);
    const label = secName === primaryName ? `Light ${secName}` : secName;
    assignments.push({
      colorKey: 'secondary',
      hexCode: analysis.colors.secondary,
      yarnName: label,
    });
  }
  if (analysis.colors.tertiary) {
    const name = hexToColorName(analysis.colors.tertiary);
    assignments.push({
      colorKey: 'tertiary',
      hexCode: analysis.colors.tertiary,
      yarnName: name,
    });
  }
  if (analysis.colors.accent) {
    const name = hexToColorName(analysis.colors.accent);
    assignments.push({
      colorKey: 'accent',
      hexCode: analysis.colors.accent,
      yarnName: name,
    });
  }

  // Add per-body-part color assignments from AI bodyPartAnalysis.
  // This ensures each section uses the ACTUAL color the AI detected for
  // that specific body part, not just the generic primary/secondary.
  if (analysis.bodyPartAnalysis) {
    const usedNames = new Set(assignments.map((a) => a.yarnName));

    for (const bp of analysis.bodyPartAnalysis) {
      if (!bp.primaryColor) continue;

      // Create a body-part-specific color key like 'bp-head', 'bp-ears', etc.
      const bpColorKey = `bp-${bp.partName}`;
      const bpName = hexToColorName(bp.primaryColor);

      // Disambiguate names so users can tell them apart
      let label = bpName;
      if (usedNames.has(label)) {
        const partLabel =
          bp.partName.charAt(0).toUpperCase() + bp.partName.slice(1);
        label = `${bpName} (${partLabel})`;
      }

      // Only add if the color is meaningfully different from primary
      // (within ~20 units of brightness difference to avoid clutter)
      const existingMatch = assignments.find(
        (a) => a.hexCode.toLowerCase() === bp.primaryColor.toLowerCase()
      );
      if (existingMatch) {
        // Reuse existing assignment — just note the mapping
        continue;
      }

      assignments.push({
        colorKey: bpColorKey,
        hexCode: bp.primaryColor,
        yarnName: label,
      });
      usedNames.add(label);
    }
  }

  // Dedicated nose color: use AI bodyPartAnalysis, then accent, then black
  let noseHex = '#000000';
  if (analysis.bodyPartAnalysis) {
    const nosePart = analysis.bodyPartAnalysis.find(
      (bp) => bp.partName === 'nose'
    );
    if (nosePart?.primaryColor) {
      noseHex = nosePart.primaryColor;
    }
  }
  if (noseHex === '#000000' && analysis.colors.accent) {
    noseHex = analysis.colors.accent;
  }
  // Only add if not already present from the body-part loop above
  if (!assignments.find((a) => a.colorKey === 'nose')) {
    assignments.push({
      colorKey: 'nose',
      hexCode: noseHex,
      yarnName: hexToColorName(noseHex),
    });
  }

  return assignments;
}

/**
 * Find the best color name for a body part by checking AI analysis,
 * then falling back to preset colorZones, then to 'primary'.
 */
function getBodyPartColorName(
  partName: string,
  analysis: DogAnalysisResult,
  customizations: PatternCustomizations
): string {
  // 1. Check AI bodyPartAnalysis for this specific body part
  const aiPartName = PRESET_TO_AI_PART[partName] || partName;
  if (analysis.bodyPartAnalysis) {
    const bp = analysis.bodyPartAnalysis.find(
      (b) => b.partName === aiPartName || b.partName === partName
    );
    if (bp?.primaryColor) {
      // Find a matching color assignment by hex
      const match = customizations.colorAssignments.find(
        (a) => a.hexCode.toLowerCase() === bp.primaryColor.toLowerCase()
      );
      if (match) {
        return match.yarnName || match.colorKey;
      }
      // Fallback: just return the color name from hex
      return hexToColorName(bp.primaryColor);
    }
  }

  // 2. For nose, look up the 'nose' assignment
  if (partName === 'nose') {
    const noseAssignment = customizations.colorAssignments.find(
      (a) => a.colorKey === 'nose'
    );
    if (noseAssignment) return noseAssignment.yarnName || 'Black';
  }

  // 3. Fall back to primary
  const primary = customizations.colorAssignments.find(
    (a) => a.colorKey === 'primary'
  );
  return primary?.yarnName || 'Main Color';
}

// ============================================================================
// PATTERN SECTIONS
// ============================================================================

function generatePatternSections(
  preset: BreedPreset,
  analysis: DogAnalysisResult,
  customizations: PatternCustomizations,
  sizeKey: string
): GeneratedPattern {
  const sections: PatternSection[] = [];
  let totalTime = 0;

  const bodyPartOrder: BodyPartName[] = [
    'head',
    'body',
    'frontLeg',
    'backLeg',
    'ear',
    'tail',
    'snout',
    'nose',
    'eyePatch',
  ];

  for (const partName of bodyPartOrder) {
    const bodyPartData = preset.bodyParts[partName];
    if (!bodyPartData) continue;

    const bodyPart = bodyPartData as unknown as JsonBodyPart;

    // Skip disabled features
    if (customizations.toggledFeatures[partName] === false) continue;

    const sizeAdjustment = customizations.sizeMultiplier || 1.0;
    const proportionAdjustment =
      customizations.proportionAdjustments[partName] || 1.0;
    const combinedMultiplier = sizeAdjustment * proportionAdjustment;

    // Generate instructions with professional formatting
    const instructions = generateInstructionsFromJsonRows(
      bodyPart.rows,
      bodyPart.colorZones || [],
      customizations,
      combinedMultiplier,
      customizations.difficultyLevel,
      partName
    );

    // Estimate time: ~2 min per row, plus setup
    const rowCount = bodyPart.rows.length;
    const quantity = bodyPart.quantity || 1;
    const estimatedTime = Math.max(
      0.3,
      ((rowCount * 2) / 60) * combinedMultiplier
    );
    totalTime += estimatedTime * quantity;

    // Handle assembly notes
    const assemblyNotesText = Array.isArray(bodyPart.assemblyNotes)
      ? bodyPart.assemblyNotes.join(' ')
      : bodyPart.assemblyNotes || '';

    // Add stuffing guidance to notes
    const stuffLevel = STUFFING_LEVEL[partName] || 'moderately';

    // Determine the starting yarn color from AI body part analysis
    const startingColorName = getBodyPartColorName(
      partName,
      analysis,
      customizations
    );

    // Look up AI crochet notes for this body part
    const aiPartName = PRESET_TO_AI_PART[partName] || partName;
    const aiBp = analysis.bodyPartAnalysis?.find(
      (b) => b.partName === aiPartName || b.partName === partName
    );
    const aiCrochetNotes = aiBp?.crochetNotes || '';

    // Build the section notes with starting color, hook size, stuffing, and AI guidance
    const hookSize = customizations.hookSizeOverride || preset.hookSize;
    const notesParts: string[] = [];
    notesParts.push(`With ${startingColorName} yarn, ${hookSize} hook.`);
    if (aiCrochetNotes) {
      notesParts.push(aiCrochetNotes);
    }
    notesParts.push(`Stuff ${stuffLevel}.`);
    if (assemblyNotesText) {
      notesParts.push(assemblyNotesText);
    }
    const notesWithStuffing = notesParts.join(' ');

    const section: PatternSection = {
      name: formatBodyPartName(partName),
      bodyParts: [partName],
      instructions,
      notes: notesWithStuffing,
      estimatedTime,
      difficultyNotes: Array.isArray(bodyPart.assemblyNotes)
        ? bodyPart.assemblyNotes[0]
        : bodyPart.assemblyNotes,
    };

    if (quantity > 1) {
      section.name = `${section.name} (make ${quantity})`;
    }

    sections.push(section);
  }

  const displayBreed = formatBreedDisplay(analysis.detectedBreed);
  const finishedHeight = HEIGHT_BY_SIZE[sizeKey] || HEIGHT_BY_SIZE.medium;

  // Build comprehensive pattern notes
  const patternNotes = [
    'Work in continuous spiral rounds unless otherwise noted. Do not join rounds with a slip stitch.',
    'Use a stitch marker to mark the first stitch of each round and move it up as you go.',
    `Gauge is not critical for amigurumi. Your stitches should be tight enough that no stuffing shows through. If stuffing is visible, try a smaller hook.`,
    `Finished size: ${finishedHeight} tall (approximate).`,
    'Stuff each piece as you go — it is much harder to stuff after closing.',
    'Leave a long yarn tail (~12 inches) when fastening off each piece for sewing during assembly.',
  ].join('\n');

  return {
    title: `${displayBreed} Amigurumi Pattern`,
    description: `Custom ${displayBreed} amigurumi crochet doll. Finished size: ${finishedHeight}. Skill level: ${preset.skillLevel}. Estimated time: ${Math.round(totalTime)} hours.`,
    sections,
    abbreviations: getStandardAbbreviations(),
    assemblyInstructions: generateAssemblyInstructions(preset, analysis),
    skillLevel: preset.skillLevel,
    estimatedTotalTime: Math.round(totalTime * 10) / 10,
    notes: patternNotes,
    generatedAt: new Date(),
  };
}

// ============================================================================
// INSTRUCTION GENERATION
// ============================================================================

function generateInstructionsFromJsonRows(
  rows: JsonRow[],
  colorZones: Array<{
    startRow: number;
    endRow: number;
    colorKey: string;
  }>,
  customizations: PatternCustomizations,
  sizeMultiplier: number,
  difficultyLevel: string,
  partName: string
): StitchInstruction[] {
  const instructions: StitchInstruction[] = [];
  const stuffLevel = STUFFING_LEVEL[partName] || 'moderately';

  // Build a row → color mapping from colorZones
  const rowColorMap = new Map<number, string>();
  for (const zone of colorZones) {
    for (let r = zone.startRow; r <= zone.endRow; r++) {
      rowColorMap.set(r, zone.colorKey);
    }
  }

  // Detect where decreases start (for stuffing reminder)
  let decreaseStartIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    const inst = rows[i].instructions.toLowerCase();
    if (
      (inst.includes('dec') || inst.includes('decrease')) &&
      decreaseStartIdx < 0
    ) {
      decreaseStartIdx = i;
      break;
    }
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = row.rowNumber;

    // Adjust stitch count for size
    let adjustedCount = Math.round(row.stitchCount * sizeMultiplier);

    // Apply difficulty-based adjustments
    if (difficultyLevel === 'simplified' && i > 2) {
      adjustedCount = Math.max(adjustedCount - 2, 1);
    }

    // Determine color for this row from colorZones or row.colorKey
    const colorKey =
      row.colorKey || rowColorMap.get(rowNum) || 'primary';

    let instruction = row.instructions;

    // Add color change note if color changes from previous row,
    // OR if this is the first row (so the user knows which yarn to start with)
    if (i === 0) {
      // First row: always state the starting color
      const colorAssignment = customizations.colorAssignments.find(
        (a) => a.colorKey === colorKey
      );
      const colorName = colorAssignment
        ? colorAssignment.yarnName || colorKey
        : colorKey;
      instruction = `With ${colorName} yarn: ${instruction}`;
    } else {
      const prevColorKey =
        rows[i - 1].colorKey ||
        rowColorMap.get(rows[i - 1].rowNumber) ||
        'primary';
      if (colorKey !== prevColorKey) {
        // Find the yarn name for this color
        const colorAssignment = customizations.colorAssignments.find(
          (a) => a.colorKey === colorKey
        );
        const colorName = colorAssignment
          ? colorAssignment.yarnName || colorKey
          : colorKey;
        instruction = `Change to ${colorName}. ${instruction}`;
      }
    }

    // Apply difficulty modifications
    if (difficultyLevel === 'simplified' && instruction.includes('x')) {
      instruction = simplifyInstruction(instruction);
    } else if (difficultyLevel === 'detailed') {
      instruction = addDetailToInstruction(instruction);
    }

    // Insert stuffing reminder before decrease section
    if (i === decreaseStartIdx && decreaseStartIdx > 0) {
      instructions.push({
        rowNumber: 0,
        instruction: `--- Insert safety eyes between Rnds ${Math.max(1, rowNum - 4)}-${rowNum - 1} if applicable. Stuff piece ${stuffLevel} before continuing. ---`,
        stitchesUsed: [],
        notes: 'Reminder',
      });
    }

    // Detect if this is the final "cut yarn" row
    const isFinalRow =
      row.stitchCount === 0 ||
      instruction.toLowerCase().includes('cut yarn') ||
      instruction.toLowerCase().includes('fasten off') ||
      instruction.toLowerCase().includes('pull through remaining');

    // Look up the actual color name for notes
    const colorNoteAssignment = customizations.colorAssignments.find(
      (a) => a.colorKey === colorKey
    );
    const colorNoteName = colorNoteAssignment
      ? colorNoteAssignment.yarnName || colorKey
      : colorKey;

    if (isFinalRow) {
      // Replace with standard fasten-off text
      instructions.push({
        rowNumber: rowNum,
        instruction: 'FO. Cut yarn, leaving a ~12-inch tail for sewing. Weave end through remaining stitches and pull tight to close.',
        stitchesUsed: [],
        notes: colorKey !== 'primary' ? `Color: ${colorNoteName}` : undefined,
      });
    } else {
      // Standard row with [X sts] bracket notation
      const finalInstruction =
        adjustedCount > 0
          ? `Rnd ${rowNum}: ${instruction} [${adjustedCount} sts]`
          : `Rnd ${rowNum}: ${instruction}`;

      instructions.push({
        rowNumber: rowNum,
        instruction: finalInstruction,
        stitchesUsed: extractStitches(instruction) as StitchType[],
        notes: colorKey !== 'primary' ? `Color: ${colorNoteName}` : undefined,
      });
    }
  }

  return instructions;
}

/**
 * Simplify a crochet instruction (for simplified difficulty)
 */
function simplifyInstruction(instruction: string): string {
  return instruction
    .replace(
      /\(Sc \d+, (inc|dec)\) x \d+/g,
      'Repeat pattern around'
    )
    .replace(
      /\(Sc \d+, (inc|dec) x \d+/g,
      'Work increases/decreases evenly'
    )
    .replace(/Magic ring/g, 'Start with magic ring');
}

/**
 * Add detail to a crochet instruction (for detailed difficulty)
 */
function addDetailToInstruction(instruction: string): string {
  let detailed = instruction;
  if (instruction.includes('inc')) {
    detailed +=
      ' — work 2 sc into the same stitch to increase';
  }
  if (instruction.includes('dec')) {
    detailed +=
      ' — insert hook through front loops of next 2 stitches, yarn over and pull through all loops (invisible decrease)';
  }
  if (instruction.includes('Magic ring')) {
    detailed +=
      ' — wrap yarn around fingers, insert hook, yarn over and pull through loop, chain 1, work stitches into the ring';
  }
  return detailed;
}

/**
 * Extract stitch types from instruction string
 */
function extractStitches(instruction: string): string[] {
  const stitches: string[] = [];
  const patterns = [
    'sc',
    'inc',
    'dec',
    'hdc',
    'dc',
    'tr',
    'slst',
    'ch',
  ];
  for (const pattern of patterns) {
    if (instruction.toLowerCase().includes(pattern)) {
      stitches.push(pattern);
    }
  }
  return stitches.length > 0 ? stitches : ['sc'];
}

// ============================================================================
// ASSEMBLY INSTRUCTIONS
// ============================================================================

function generateAssemblyInstructions(
  preset: BreedPreset,
  analysis: DogAnalysisResult
): string[] {
  // If the preset has good assembly instructions, enhance them
  if (preset.assemblyInstructions && preset.assemblyInstructions.length > 0) {
    const enhanced = preset.assemblyInstructions.map((step) =>
      step.replace(/^\d+\.\s*/, '')
    );
    // Add general tips at the end
    return [
      ...enhanced,
      'Use the long yarn tails to sew each piece. Pin pieces in place before sewing to check positioning.',
      'For a neater finish, use a whip stitch or mattress stitch to join pieces.',
      'Weave in all remaining ends securely and trim.',
    ];
  }

  // Fallback: generate assembly instructions from analysis
  const earType =
    analysis.earShape === 'pointy' || analysis.earShape === 'button'
      ? 'erect — sew to top of head so they stand up'
      : 'floppy — sew to sides of head and let hang down naturally';

  return [
    'Attach safety eyes to head between Rnds 8-10, spaced about 6 stitches apart. Secure with washers on the inside.',
    'Sew snout to front-center of head, positioned below the eyes.',
    'Sew nose to tip of snout.',
    `Sew ears to head — ${earType}.`,
    'Sew head to body. Pin in place first to ensure it sits straight.',
    'Sew front legs to body, positioned at front corners just below the head join.',
    'Sew back legs to body at back corners — ensure the doll can sit upright.',
    `Sew tail to back of body with a slight curve.`,
    'Embroider any additional details: mouth line, eyebrows, or markings using embroidery thread.',
    'Use the long yarn tails to sew each piece. Pin pieces in place before sewing to check positioning.',
    'For a neater finish, use a whip stitch or mattress stitch to join pieces.',
    'Weave in all remaining ends securely and trim.',
  ];
}

// ============================================================================
// MATERIALS LIST
// ============================================================================

function generateMaterialsList(
  preset: BreedPreset,
  customizations: PatternCustomizations,
  sizeKey: string
): PatternMaterials {
  const yarns: YarnInfo[] = [];
  const yardageTable = YARDAGE_BY_SIZE[sizeKey] || YARDAGE_BY_SIZE.medium;

  // Calculate total yardage across all body parts
  const bodyPartOrder: BodyPartName[] = [
    'head',
    'body',
    'frontLeg',
    'backLeg',
    'ear',
    'tail',
    'snout',
    'nose',
    'eyePatch',
  ];

  // Build a map of body part → primary color from preset colorZones
  const partColorMap = new Map<string, string>();
  for (const partName of bodyPartOrder) {
    const bodyPartData = preset.bodyParts[partName] as unknown as
      | JsonBodyPart
      | undefined;
    if (!bodyPartData) continue;

    // Check colorZones to determine which colors this part uses
    if (bodyPartData.colorZones) {
      for (const zone of bodyPartData.colorZones) {
        const zoneRows = zone.endRow - zone.startRow + 1;
        const totalRows = bodyPartData.rows.length;
        const fraction = zoneRows / totalRows;
        const key = `${partName}:${zone.colorKey}`;
        partColorMap.set(key, `${fraction}`);
      }
    } else {
      partColorMap.set(`${partName}:primary`, '1.0');
    }
  }

  // Accumulate yardage per color
  const yardagePerColor: Record<string, number> = {};

  for (const partName of bodyPartOrder) {
    const bodyPartData = preset.bodyParts[partName] as unknown as
      | JsonBodyPart
      | undefined;
    if (!bodyPartData) continue;
    if (customizations.toggledFeatures[partName] === false) continue;

    const baseYardage = yardageTable[partName] || 10;
    const quantity = bodyPartData.quantity || 1;
    const totalPartYardage = baseYardage * quantity;

    if (bodyPartData.colorZones && bodyPartData.colorZones.length > 0) {
      // Distribute yardage across colors based on zone coverage
      const totalRows = bodyPartData.rows.filter(
        (r) => r.stitchCount > 0
      ).length;

      for (const zone of bodyPartData.colorZones) {
        const zoneRows = Math.min(
          zone.endRow,
          bodyPartData.rows.length
        ) - zone.startRow + 1;
        const fraction = totalRows > 0 ? zoneRows / totalRows : 1;
        const colorYardage = totalPartYardage * fraction;
        yardagePerColor[zone.colorKey] =
          (yardagePerColor[zone.colorKey] || 0) + colorYardage;
      }
    } else {
      // All primary
      yardagePerColor['primary'] =
        (yardagePerColor['primary'] || 0) + totalPartYardage;
    }
  }

  // Generate yarn entries
  for (const assignment of customizations.colorAssignments) {
    let yardage = yardagePerColor[assignment.colorKey] || 0;

    // Minimum yardage for detail colors
    if (yardage === 0) {
      yardage = assignment.colorKey === 'nose' ? 3 : 5;
    }

    // Add 15% buffer + 3 yards for tails and joining
    yardage = yardage * 1.15 + 3;

    // Round up to nearest whole number
    yardage = Math.ceil(yardage);

    // Minimum 3 yards for any yarn
    yardage = Math.max(3, yardage);

    yarns.push({
      name: assignment.yarnName || assignment.colorKey,
      colorName: assignment.colorKey,
      hexCode: assignment.hexCode,
      yardage,
      weight: preset.yarnWeight,
    });
  }

  const totalYardage = yarns.reduce((sum, y) => sum + y.yardage, 0);
  const stuffingAmount =
    STUFFING_BY_SIZE[sizeKey] || STUFFING_BY_SIZE.medium;
  const safetyEyeSize =
    SAFETY_EYES_BY_SIZE[sizeKey] || SAFETY_EYES_BY_SIZE.medium;

  // Determine if pointy ears need pipe cleaners
  const earShape = preset.defaultEarShape;
  const needsPipeCleaners =
    earShape === 'pointy' || earShape === 'button';

  const hookSize =
    customizations.hookSizeOverride || preset.hookSize;

  const notions = [
    {
      name: `Safety eyes, ${safetyEyeSize}`,
      quantity: 2,
      unit: 'pieces',
    },
    {
      name: 'Safety eye washers/backings',
      quantity: 2,
      unit: 'pieces',
    },
    { name: 'Stitch markers', quantity: 2, unit: 'pieces' },
    { name: 'Yarn needle (tapestry needle)', quantity: 1, unit: 'piece' },
  ];

  if (needsPipeCleaners) {
    notions.push({
      name: 'Pipe cleaners (for ear support)',
      quantity: 2,
      unit: 'pieces',
    });
  }

  const additionalSupplies = [
    'Embroidery thread or floss (black — for mouth, eyebrows, details)',
    'Scissors',
    'Pins (for positioning pieces before sewing)',
    'Row counter or pen & paper (to track rounds)',
  ];

  return {
    yarns,
    hookSize,
    hookSizeInfo: `${hookSize} crochet hook (use 1-2 sizes smaller than yarn label recommends for tight amigurumi fabric)`,
    notions,
    stuffingAmount: Math.round(stuffingAmount * 10) / 10,
    stuffingType: 'Polyester fiberfill',
    additionalSupplies,
    totalYardageNeeded: totalYardage,
  };
}

// ============================================================================
// ABBREVIATIONS
// ============================================================================

function getStandardAbbreviations(): Record<string, string> {
  return {
    MR: 'magic ring',
    sc: 'single crochet',
    inc: 'increase (2 sc in same stitch)',
    dec: 'invisible decrease (insert hook through front loops of next 2 sts, yarn over, pull through all)',
    hdc: 'half double crochet',
    dc: 'double crochet',
    tr: 'treble crochet',
    slst: 'slip stitch',
    ch: 'chain',
    st: 'stitch',
    sts: 'stitches',
    Rnd: 'round',
    FO: 'fasten off',
    FLO: 'front loop only',
    BLO: 'back loop only',
    sk: 'skip',
    'x N': 'repeat N times',
    '[ ]': 'stitch count at end of round',
  };
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

function formatBreedDisplay(breedId: string): string {
  return breedId
    .split(/[-\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatBodyPartName(name: BodyPartName): string {
  const names: Record<BodyPartName, string> = {
    head: 'Head',
    body: 'Body',
    frontLeg: 'Front Legs',
    backLeg: 'Back Legs',
    ear: 'Ears',
    tail: 'Tail',
    snout: 'Snout',
    nose: 'Nose',
    eyePatch: 'Eye Patch',
  };
  return names[name] || name;
}

// ============================================================================
// FALLBACK BODY PART ANALYSIS
// ============================================================================

function generateFallbackBodyPartAnalysis(
  analysis: DogAnalysisResult
): BodyPartAnalysis[] {
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
      shape:
        build === 'stocky' || build === 'massive'
          ? 'broad, rounded'
          : 'rounded',
      texture: 'smooth',
      relativeSize: analysis.bodyProportions?.headToBodyRatio || 0.28,
      crochetNotes:
        'Work in continuous rounds. Stuff firmly for a rounded head shape.',
    },
    {
      partName: 'body',
      colors: secondary !== primary ? [primary, secondary] : [primary],
      primaryColor: primary,
      markings: [],
      shape: build,
      texture: 'smooth',
      relativeSize: 1.0,
      crochetNotes: `Create the main body shape. ${
        build === 'stocky'
          ? 'Use wider increases for a stocky build.'
          : build === 'slender'
            ? 'Keep a slim profile with fewer increases.'
            : 'Work standard increases for the body.'
      }`,
    },
    {
      partName: 'ears',
      colors: [primary],
      primaryColor: primary,
      markings: [],
      shape: String(earShape),
      texture: 'smooth',
      relativeSize: analysis.bodyProportions?.earSize || 0.15,
      crochetNotes:
        earShape === 'pointy'
          ? 'Create pointed triangular ears. Use pipe cleaners inside to keep them upright.'
          : 'Create flat, rounded ear pieces. Leave unstuffed for a natural floppy look.',
    },
    {
      partName: 'tail',
      colors: [primary],
      primaryColor: primary,
      markings: [],
      shape: String(tailType),
      texture: 'smooth',
      relativeSize: analysis.bodyProportions?.tailLength || 0.15,
      crochetNotes: `Shape the tail to match a ${tailType} style. Stuff lightly.`,
    },
    {
      partName: 'snout',
      colors: [primary],
      primaryColor: primary,
      markings: [],
      shape: snoutLen < 0.25 ? 'short, flat' : 'medium',
      texture: 'smooth',
      relativeSize: snoutLen,
      crochetNotes:
        snoutLen < 0.25
          ? 'Very short snout — almost flush with the face.'
          : 'Attach centered on the lower half of the head.',
    },
  ];
}
