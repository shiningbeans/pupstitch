import {
  GeneratedPattern,
  PatternSection,
  PatternMaterials,
  StitchInstruction,
} from '@/types';

/**
 * Format a complete pattern as readable text suitable for printing or export
 * @param pattern - The generated pattern to format
 * @returns Formatted text string
 */
export function formatPatternText(pattern: GeneratedPattern): string {
  const lines: string[] = [];

  // Title and metadata
  lines.push(`# ${pattern.title}`);
  lines.push(`Description: ${pattern.description}`);
  lines.push(`Skill Level: ${pattern.skillLevel}`);
  lines.push(
    `Estimated Time: ${Math.round(pattern.estimatedTotalTime)} hours`
  );
  lines.push('');

  // Abbreviations
  lines.push('## Abbreviations');
  for (const [abbrev, full] of Object.entries(pattern.abbreviations)) {
    lines.push(`${abbrev} = ${full}`);
  }
  lines.push('');

  // Pattern sections
  lines.push('## Pattern Instructions');
  for (const section of pattern.sections) {
    lines.push(formatSection(section));
  }
  lines.push('');

  // Assembly
  if (pattern.assemblyInstructions && pattern.assemblyInstructions.length > 0) {
    lines.push('## Assembly Instructions');
    for (let i = 0; i < pattern.assemblyInstructions.length; i++) {
      lines.push(`${i + 1}. ${pattern.assemblyInstructions[i]}`);
    }
    lines.push('');
  }

  // Notes
  if (pattern.notes) {
    lines.push('## Notes');
    lines.push(pattern.notes);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format a single pattern section (body part)
 * @param section - The section to format
 * @returns Formatted text string
 */
export function formatSection(section: PatternSection): string {
  const lines: string[] = [];

  // Section header
  lines.push(`### ${section.name}`);
  if (section.difficultyNotes) {
    lines.push(`Notes: ${section.difficultyNotes}`);
  }
  if (section.notes) {
    lines.push(`Assembly: ${section.notes}`);
  }
  lines.push(`Estimated time: ${section.estimatedTime.toFixed(1)} hours`);
  lines.push('');

  // Instructions
  for (const instruction of section.instructions) {
    lines.push(instruction.instruction);
    if (instruction.notes) {
      lines.push(`  (${instruction.notes})`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Format a materials list
 * @param materials - The materials to format
 * @returns Formatted text string
 */
export function formatMaterialsList(materials: PatternMaterials): string {
  const lines: string[] = [];

  lines.push('# Materials Needed');
  lines.push('');

  // Yarns
  lines.push('## Yarn');
  for (const yarn of materials.yarns) {
    lines.push(
      `- ${yarn.name}: ${yarn.yardage} yards (${yarn.weight} weight)`
    );
  }
  lines.push('');

  // Tools
  lines.push('## Tools');
  lines.push(`- Hook: ${materials.hookSize} (${materials.hookSizeInfo})`);
  lines.push('');

  // Notions
  if (materials.notions.length > 0) {
    lines.push('## Notions & Supplies');
    for (const notion of materials.notions) {
      lines.push(
        `- ${notion.name}: ${notion.quantity} ${notion.unit}`
      );
    }
    lines.push('');
  }

  // Stuffing
  lines.push('## Stuffing');
  lines.push(
    `- ${materials.stuffingType}: ${materials.stuffingAmount} oz`
  );
  lines.push('');

  // Additional
  if (materials.additionalSupplies && materials.additionalSupplies.length > 0) {
    lines.push('## Additional Supplies');
    for (const supply of materials.additionalSupplies) {
      lines.push(`- ${supply}`);
    }
    lines.push('');
  }

  // Total
  lines.push('---');
  lines.push(
    `Total Yardage: ${materials.totalYardageNeeded} yards`
  );

  return lines.join('\n');
}

/**
 * Format pattern as markdown
 * @param pattern - The pattern to format
 * @returns Markdown string
 */
export function formatPatternMarkdown(
  pattern: GeneratedPattern
): string {
  const lines: string[] = [];

  lines.push(`# ${pattern.title}`);
  lines.push('');
  lines.push(pattern.description);
  lines.push('');

  lines.push(`**Skill Level:** ${pattern.skillLevel}`);
  lines.push(
    `**Estimated Time:** ${Math.round(pattern.estimatedTotalTime)} hours`
  );
  lines.push('');

  // Abbreviations table
  lines.push('| Abbreviation | Full Name |');
  lines.push('|---|---|');
  for (const [abbrev, full] of Object.entries(pattern.abbreviations)) {
    lines.push(`| ${abbrev} | ${full} |`);
  }
  lines.push('');

  // Sections
  for (const section of pattern.sections) {
    lines.push(`## ${section.name}`);
    if (section.notes) {
      lines.push(`> ${section.notes}`);
    }
    lines.push('');

    for (const instruction of section.instructions) {
      lines.push(`- ${instruction.instruction}`);
    }
    lines.push('');
  }

  // Assembly
  if (pattern.assemblyInstructions && pattern.assemblyInstructions.length > 0) {
    lines.push('## Assembly');
    for (let i = 0; i < pattern.assemblyInstructions.length; i++) {
      lines.push(`${i + 1}. ${pattern.assemblyInstructions[i]}`);
    }
  }

  return lines.join('\n');
}

/**
 * Get standard crochet abbreviations and their full forms
 * @returns Map of abbreviations to full names
 */
export function getAbbreviations(): Record<string, string> {
  return {
    MR: 'magic ring (adjustable ring)',
    sc: 'single crochet',
    inc: 'increase (2 sc in same stitch)',
    dec: 'invisible decrease (sc2tog through front loops)',
    sc2tog: 'single crochet 2 together (decrease)',
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
    tog: 'together',
    yo: 'yarn over',
    'x N': 'repeat N times',
    '[ ]': 'stitch count at end of round',
  };
}

/**
 * Format a single stitch instruction for display
 * @param instruction - The instruction to format
 * @returns Formatted string
 */
export function formatInstruction(instruction: StitchInstruction): string {
  let formatted = instruction.instruction;

  // Add notes if present
  if (instruction.notes) {
    formatted += ` (${instruction.notes})`;
  }

  return formatted;
}

/**
 * Create a summary of pattern complexity
 * @param pattern - The pattern to summarize
 * @returns Summary string
 */
export function getPatternSummary(pattern: GeneratedPattern): string {
  const totalInstructions = pattern.sections.reduce(
    (sum, s) => sum + s.instructions.length,
    0
  );

  const uniqueStitches = new Set<string>();
  for (const section of pattern.sections) {
    for (const inst of section.instructions) {
      inst.stitchesUsed.forEach((s) => uniqueStitches.add(s));
    }
  }

  return (
    `Pattern: ${pattern.title}\n` +
    `Sections: ${pattern.sections.length}\n` +
    `Total Instructions: ${totalInstructions}\n` +
    `Unique Stitches: ${Array.from(uniqueStitches).join(', ')}\n` +
    `Skill Level: ${pattern.skillLevel}\n` +
    `Estimated Time: ${Math.round(pattern.estimatedTotalTime)} hours`
  );
}

/**
 * Format materials as a shopping list
 * @param materials - The materials to format
 * @returns Shopping list string
 */
export function formatShoppingList(materials: PatternMaterials): string {
  const lines: string[] = [];

  lines.push('# Shopping List');
  lines.push('');

  lines.push('## Yarn');
  for (const yarn of materials.yarns) {
    lines.push(
      `☐ ${yarn.name} - ${yarn.yardage} yards (${yarn.colorName})`
    );
  }
  lines.push('');

  lines.push('## Tools');
  lines.push(`☐ Crochet hook: ${materials.hookSize}`);
  lines.push('');

  lines.push('## Supplies');
  for (const notion of materials.notions) {
    lines.push(`☐ ${notion.name} (${notion.quantity} ${notion.unit})`);
  }
  if (materials.stuffingType) {
    lines.push(`☐ ${materials.stuffingType} - ${materials.stuffingAmount} oz`);
  }
  if (materials.additionalSupplies) {
    for (const supply of materials.additionalSupplies) {
      lines.push(`☐ ${supply}`);
    }
  }

  return lines.join('\n');
}
