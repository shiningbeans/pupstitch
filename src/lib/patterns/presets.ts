import { DogBreed, BreedPreset, DollSize } from '@/types';

// Import all breed presets
import labradorPreset from '@/../data/presets/labrador.json';
import germanShepherdPreset from '@/../data/presets/german-shepherd.json';
import goldenRetrieverPreset from '@/../data/presets/golden-retriever.json';
import frenchBulldogPreset from '@/../data/presets/french-bulldog.json';
import bulldogPreset from '@/../data/presets/bulldog.json';
import poodlePreset from '@/../data/presets/poodle.json';
import beaglePreset from '@/../data/presets/beagle.json';
import rottweilerPreset from '@/../data/presets/rottweiler.json';
import dachshundPreset from '@/../data/presets/dachshund.json';
import corgiPreset from '@/../data/presets/corgi.json';

/**
 * Map of all available breed presets
 */
const BREED_PRESETS: Record<DogBreed, BreedPreset> = {
  labrador: labradorPreset as unknown as BreedPreset,
  'german-shepherd': germanShepherdPreset as unknown as BreedPreset,
  'golden-retriever': goldenRetrieverPreset as unknown as BreedPreset,
  'french-bulldog': frenchBulldogPreset as unknown as BreedPreset,
  bulldog: bulldogPreset as unknown as BreedPreset,
  poodle: poodlePreset as unknown as BreedPreset,
  beagle: beaglePreset as unknown as BreedPreset,
  rottweiler: rottweilerPreset as unknown as BreedPreset,
  dachshund: dachshundPreset as unknown as BreedPreset,
  corgi: corgiPreset as unknown as BreedPreset,
};

/**
 * Get a breed preset by breed ID and optional size.
 * When a size is specified and the preset has size-specific data,
 * the body parts are replaced with the size-specific versions.
 * @param breedId - The breed identifier
 * @param size - Optional doll size (small, medium, large)
 * @returns The breed preset (with size-specific body parts if available) or undefined
 */
export function getPreset(breedId: string, size?: DollSize): BreedPreset | undefined {
  const preset = BREED_PRESETS[breedId as DogBreed];
  if (!preset) return undefined;

  const rawPreset = preset as unknown as Record<string, unknown>;
  const sizes = rawPreset.sizes as Record<string, Record<string, unknown>> | undefined;

  // Determine which size config to use (default to 'medium')
  const effectiveSize = size || 'medium';
  const sizeConfig = sizes?.[effectiveSize] || sizes?.['medium'];

  // Normalize presets that use alternate JSON format:
  // Some presets have top-level: { breed, description, sizes: { small/medium/large: { hookSize, yarnWeight, bodyParts, ... } } }
  // Others have top-level: { name, breedId, skillLevel, hookSize, yarnWeight, bodyParts, sizes: { ... } }
  // We need to handle both by extracting data from the size config when top-level fields are missing.
  const breedName = (rawPreset.name as string)
    || (rawPreset.breed as string)
    || breedId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Extract assembly instructions from either format
  let assemblyInstructions: string[] = [];
  if (rawPreset.assemblyInstructions) {
    assemblyInstructions = rawPreset.assemblyInstructions as string[];
  } else if (sizeConfig?.assembly) {
    const asm = sizeConfig.assembly as Record<string, unknown>;
    const instrText = asm.instructions as string;
    if (instrText) {
      // Split the combined instructions string into individual steps
      assemblyInstructions = instrText
        .split(/\.\s+/)
        .filter(s => s.trim().length > 0)
        .map(s => s.trim().endsWith('.') ? s.trim() : s.trim() + '.');
    }
  }

  // Extract default colors
  let defaultColors = rawPreset.defaultColors as BreedPreset['defaultColors'] | undefined;
  if (!defaultColors && sizeConfig?.colors) {
    const sc = sizeConfig.colors as Record<string, string>;
    defaultColors = {
      primary: sc.primary || '#8B4513',
      secondary: sc.secondary,
      accent: sc.accent || sc.nose,
    };
  }

  // Build the normalized preset
  const normalized: BreedPreset = {
    ...preset,
    breedId: (rawPreset.breedId as DogBreed) || (breedId as DogBreed),
    name: breedName,
    description: (rawPreset.description as string) || `${breedName} amigurumi pattern`,
    baseSize: (rawPreset.baseSize as BreedPreset['baseSize']) || 'medium',
    skillLevel: (rawPreset.skillLevel as BreedPreset['skillLevel']) || 'intermediate',
    estimatedHours: (rawPreset.estimatedHours as number) || 4,
    hookSize: (sizeConfig?.hookSize as string) || preset.hookSize || '3.5mm',
    yarnWeight: (sizeConfig?.yarnWeight as BreedPreset['yarnWeight']) || preset.yarnWeight || 'worsted',
    bodyParts: (sizeConfig?.bodyParts as BreedPreset['bodyParts']) || preset.bodyParts,
    assemblyInstructions,
    defaultEarShape: (rawPreset.defaultEarShape as BreedPreset['defaultEarShape']) || 'floppy',
    defaultTailType: (rawPreset.defaultTailType as BreedPreset['defaultTailType']) || 'straight',
  };

  if (defaultColors) {
    normalized.defaultColors = defaultColors;
  }

  return normalized;
}

/**
 * Mapping of all common dog breed names to preset breed IDs
 */
const BREED_NAME_TO_PRESET_MAP: Record<string, DogBreed> = {
  // Labrador preset
  'labrador retriever': 'labrador',
  'chesapeake bay retriever': 'labrador',

  // Golden Retriever preset
  'golden retriever': 'golden-retriever',
  'brittany': 'golden-retriever',
  'english springer spaniel': 'golden-retriever',
  'cocker spaniel': 'golden-retriever',

  // Beagle preset
  'beagle': 'beagle',
  'basset hound': 'beagle',
  'bloodhound': 'beagle',

  // German Shepherd preset
  'german shepherd': 'german-shepherd',
  'siberian husky': 'german-shepherd',
  'alaskan malamute': 'german-shepherd',
  'australian shepherd': 'german-shepherd',
  'shetland sheepdog': 'german-shepherd',
  'border collie': 'german-shepherd',
  'collie': 'german-shepherd',
  'old english sheepdog': 'german-shepherd',

  // French Bulldog preset
  'french bulldog': 'french-bulldog',
  'chihuahua': 'french-bulldog',
  'italian greyhound': 'french-bulldog',
  'toy fox terrier': 'french-bulldog',
  'brussels griffon': 'french-bulldog',
  'pomeranian': 'french-bulldog',
  'maltese': 'french-bulldog',
  'papillon': 'french-bulldog',

  // Bulldog preset
  'bulldog': 'bulldog',
  'american bulldog': 'bulldog',
  'pug': 'bulldog',
  'pekingese': 'bulldog',
  'shih tzu': 'bulldog',
  'lhasa apso': 'bulldog',

  // Poodle preset
  'poodle (standard)': 'poodle',
  'poodle (miniature)': 'poodle',
  'poodle (toy)': 'poodle',
  'bichon frise': 'poodle',

  // Rottweiler preset
  'rottweiler': 'rottweiler',
  'doberman pinscher': 'rottweiler',
  'great dane': 'rottweiler',
  'boxer': 'rottweiler',
  'bullmastiff': 'rottweiler',
  'mastiff': 'rottweiler',
  'saint bernard': 'rottweiler',

  // Dachshund preset
  'dachshund': 'dachshund',

  // Corgi preset
  'corgi (pembroke welsh)': 'corgi',
  'corgi (cardigan welsh)': 'corgi',

  // Mixed Breed
  'mixed breed / other': 'labrador', // Default to Labrador for mixed breeds
};

/**
 * Convert any dog breed name to the closest preset breed ID.
 * Handles compound/mixed breed names like "boxer-beagle" by checking
 * each component word against known breeds.
 * @param breedName - The breed name to convert
 * @returns The closest matching preset breed ID
 */
export function getPresetBreedId(breedName: string): DogBreed {
  const normalized = breedName.toLowerCase().trim();

  // Direct match in breed name map
  if (BREED_NAME_TO_PRESET_MAP[normalized]) {
    return BREED_NAME_TO_PRESET_MAP[normalized];
  }

  // Direct match as a preset ID (e.g., "labrador", "german-shepherd")
  if (BREED_PRESETS[normalized as DogBreed]) {
    return normalized as DogBreed;
  }

  // Try splitting compound/mixed breed names and matching components
  // Handles cases like "boxer-beagle", "lab mix", "golden/poodle"
  const parts = normalized.split(/[-\s\/,]+/);
  for (const part of parts) {
    if (BREED_NAME_TO_PRESET_MAP[part]) {
      return BREED_NAME_TO_PRESET_MAP[part];
    }
    if (BREED_PRESETS[part as DogBreed]) {
      return part as DogBreed;
    }
  }

  // Default fallback
  return 'labrador';
}

/**
 * Get all available breed presets as a summary array
 * @returns Array of breed preset summaries with basic information
 */
export function getAllPresets(): Array<{
  breedId: DogBreed;
  name: string;
  description: string;
  baseSize: string;
  skillLevel: string;
  estimatedHours: number;
}> {
  return Object.values(BREED_PRESETS).map((preset) => ({
    breedId: preset.breedId,
    name: preset.name,
    description: preset.description,
    baseSize: preset.baseSize,
    skillLevel: preset.skillLevel,
    estimatedHours: preset.estimatedHours,
  }));
}

/**
 * Calculate Levenshtein distance between two strings for fuzzy matching
 * @param a - First string
 * @param b - Second string
 * @returns Distance value (lower = closer match)
 */
function levenshteinDistance(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  const matrix: number[][] = Array(bLower.length + 1)
    .fill(null)
    .map(() => Array(aLower.length + 1).fill(0));

  for (let i = 0; i <= aLower.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= bLower.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= bLower.length; j++) {
    for (let i = 1; i <= aLower.length; i++) {
      const indicator = aLower[i - 1] === bLower[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[bLower.length][aLower.length];
}

/**
 * Find the closest matching breed to a given breed name using fuzzy matching
 * @param breedName - The breed name to match
 * @returns The closest matching preset or undefined if no good match found
 */
export function getClosestBreed(
  breedName: string
): BreedPreset | undefined {
  if (!breedName || breedName.trim().length === 0) {
    return undefined;
  }

  let closestBreed: BreedPreset | undefined;
  let closestDistance = Infinity;
  const maxDistance = 3; // Allow up to 3 character differences

  Object.values(BREED_PRESETS).forEach((preset) => {
    // Check distance to the full name
    const nameDistance = levenshteinDistance(breedName, preset.name);

    // Check distance to the breed ID
    const idDistance = levenshteinDistance(
      breedName,
      preset.breedId.replace('-', ' ')
    );

    // Use the minimum distance
    const minDistance = Math.min(nameDistance, idDistance);

    if (minDistance < closestDistance) {
      closestDistance = minDistance;
      closestBreed = preset;
    }
  });

  // Only return a match if it's within tolerance
  if (closestDistance <= maxDistance) {
    return closestBreed;
  }

  return undefined;
}
