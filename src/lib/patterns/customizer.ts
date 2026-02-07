import {
  CustomPattern,
  PatternCustomizations,
  ColorAssignment,
  BodyPartName,
  DifficultyLevel,
} from '@/types';
import { generatePattern as generatePatternInternal } from './generator';
import { getPreset } from './presets';

/**
 * Update color assignments in a pattern
 * @param pattern - The pattern to modify
 * @param colorAssignments - New color assignments
 * @returns Updated pattern
 */
export function updateColors(
  pattern: CustomPattern,
  colorAssignments: ColorAssignment[]
): CustomPattern {
  const updated = { ...pattern };
  updated.customizations.colorAssignments = colorAssignments;
  updated.updatedAt = new Date();

  // Regenerate pattern to apply color changes
  return regeneratePattern(updated);
}

/**
 * Toggle a feature (body part) on or off
 * @param pattern - The pattern to modify
 * @param featureName - Name of the feature to toggle
 * @param enabled - Whether to enable or disable the feature
 * @returns Updated pattern
 */
export function toggleFeature(
  pattern: CustomPattern,
  featureName: BodyPartName | string,
  enabled: boolean
): CustomPattern {
  const updated = { ...pattern };
  updated.customizations.toggledFeatures[featureName] = enabled;
  updated.updatedAt = new Date();

  return regeneratePattern(updated);
}

/**
 * Adjust proportions for a body part
 * @param pattern - The pattern to modify
 * @param bodyPart - Name of the body part
 * @param modifier - Multiplier for the proportion (1.0 = default, 1.2 = 20% larger)
 * @returns Updated pattern
 */
export function adjustProportions(
  pattern: CustomPattern,
  bodyPart: BodyPartName | string,
  modifier: number
): CustomPattern {
  const updated = { ...pattern };

  // Clamp modifier between 0.5 and 2.0
  const clampedModifier = Math.max(0.5, Math.min(2.0, modifier));

  updated.customizations.proportionAdjustments[bodyPart] =
    clampedModifier;
  updated.updatedAt = new Date();

  return regeneratePattern(updated);
}

/**
 * Set the difficulty level of the pattern
 * @param pattern - The pattern to modify
 * @param level - The difficulty level ('simplified', 'standard', or 'detailed')
 * @returns Updated pattern
 */
export function setDifficulty(
  pattern: CustomPattern,
  level: DifficultyLevel
): CustomPattern {
  const updated = { ...pattern };
  updated.customizations.difficultyLevel = level;
  updated.updatedAt = new Date();

  // Apply difficulty-specific modifications
  if (level === 'simplified') {
    // Merge similar rows, reduce details
    simplifyPattern(updated);
  } else if (level === 'detailed') {
    // Add more texture instructions and details
    addDetailToPattern(updated);
  }
  // 'standard' requires no special modifications beyond instruction generation

  return regeneratePattern(updated);
}

/**
 * Apply all customizations at once
 * @param pattern - The pattern to modify
 * @param customizations - The customizations to apply
 * @returns Updated pattern
 */
export function applyCustomizations(
  pattern: CustomPattern,
  customizations: Partial<PatternCustomizations>
): CustomPattern {
  const updated = { ...pattern };

  // Merge customizations
  if (customizations.colorAssignments) {
    updated.customizations.colorAssignments =
      customizations.colorAssignments;
  }
  if (customizations.toggledFeatures) {
    updated.customizations.toggledFeatures = {
      ...updated.customizations.toggledFeatures,
      ...customizations.toggledFeatures,
    };
  }
  if (customizations.proportionAdjustments) {
    updated.customizations.proportionAdjustments = {
      ...updated.customizations.proportionAdjustments,
      ...customizations.proportionAdjustments,
    };
  }
  if (customizations.difficultyLevel) {
    updated.customizations.difficultyLevel =
      customizations.difficultyLevel;
  }
  if (customizations.hookSizeOverride) {
    updated.customizations.hookSizeOverride =
      customizations.hookSizeOverride;
  }
  if (customizations.yarnWeightOverride) {
    updated.customizations.yarnWeightOverride =
      customizations.yarnWeightOverride;
  }
  if (customizations.sizeMultiplier) {
    updated.customizations.sizeMultiplier =
      customizations.sizeMultiplier;
  }
  if (customizations.notes) {
    updated.customizations.notes = customizations.notes;
  }

  updated.updatedAt = new Date();

  // Regenerate the entire pattern with new settings
  return regeneratePattern(updated);
}

/**
 * Regenerate pattern from current customizations
 */
function regeneratePattern(pattern: CustomPattern): CustomPattern {
  // Re-generate the pattern using the generator with current customizations
  const { generatedPattern, materials } = generatePatternData(
    pattern
  );

  pattern.generatedPattern = generatedPattern;
  pattern.materials = materials;
  pattern.editorState = pattern.editorState || {
    activeTab: 'overview',
    expandedSections: [],
    hasUnsavedChanges: true,
    lastEditedAt: new Date(),
    editHistory: [],
  };

  // Update editor state
  pattern.editorState.hasUnsavedChanges = true;
  pattern.editorState.lastEditedAt = new Date();

  return pattern;
}

/**
 * Generate pattern data from analysis and customizations
 */
function generatePatternData(pattern: CustomPattern) {
  // Use imported getPreset
  const preset = getPreset(pattern.breedId);
  if (!preset) {
    throw new Error(`Preset not found for breed: ${pattern.breedId}`);
  }

  const fullPattern = generatePatternInternal(
    pattern.analysisResult,
    preset,
    pattern.customizations
  );

  return {
    generatedPattern: fullPattern.generatedPattern,
    materials: fullPattern.materials,
  };
}

/**
 * Simplify a pattern by merging similar rows
 */
function simplifyPattern(pattern: CustomPattern): void {
  // Modify sections to merge consecutive rows with same instructions
  for (const section of pattern.generatedPattern.sections) {
    const simplified: typeof section.instructions = [];
    let lastInstruction: typeof section.instructions[0] | null = null;
    let repeatCount = 0;

    for (const instruction of section.instructions) {
      if (
        lastInstruction &&
        lastInstruction.instruction === instruction.instruction
      ) {
        repeatCount++;
      } else {
        if (lastInstruction && repeatCount > 1) {
          lastInstruction.instruction = `${lastInstruction.instruction} [repeat for ${repeatCount} rows]`;
        }
        if (lastInstruction) {
          simplified.push(lastInstruction);
        }
        lastInstruction = instruction;
        repeatCount = 1;
      }
    }

    if (lastInstruction) {
      if (repeatCount > 1) {
        lastInstruction.instruction = `${lastInstruction.instruction} [repeat for ${repeatCount} rows]`;
      }
      simplified.push(lastInstruction);
    }

    section.instructions = simplified;
  }
}

/**
 * Add detail to a pattern
 */
function addDetailToPattern(pattern: CustomPattern): void {
  // Add texture and stitch-specific notes
  for (const section of pattern.generatedPattern.sections) {
    for (const instruction of section.instructions) {
      if (instruction.instruction.includes('inc')) {
        instruction.instruction +=
          ' - 2 stitches in the same stitch for smooth increases';
      }
      if (instruction.instruction.includes('dec')) {
        instruction.instruction +=
          ' - insert through 2 stitches and pull yarn through both for smooth decreases';
      }
      if (instruction.instruction.includes('Magic ring')) {
        instruction.instruction +=
          ' - this creates a tight center, perfect for amigurumi';
      }
    }
  }
}

/**
 * Calculate total yardage needed based on customizations
 */
export function calculateTotalYardage(pattern: CustomPattern): number {
  return pattern.materials.totalYardageNeeded;
}

/**
 * Get estimated time to complete pattern
 */
export function getEstimatedTime(pattern: CustomPattern): number {
  return pattern.generatedPattern.estimatedTotalTime;
}

/**
 * Get estimated cost based on yarn prices
 */
export function getEstimatedCost(
  pattern: CustomPattern,
  pricePerYard: number = 0.5
): number {
  return calculateTotalYardage(pattern) * pricePerYard;
}
