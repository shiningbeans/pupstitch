/**
 * PupStitch - Amigurumi Crochet Pattern Generator App
 * Comprehensive TypeScript type definitions
 */

// ============================================================================
// STITCH TYPES
// ============================================================================

/**
 * Basic crochet stitch types
 */
export type StitchType =
  | 'sc' // single crochet
  | 'inc' // increase
  | 'dec' // decrease
  | 'hdc' // half double crochet
  | 'dc' // double crochet
  | 'tr' // treble
  | 'slst' // slip stitch
  | 'ch' // chain
  | 'FLO' // front loop only
  | 'BLO'; // back loop only

/**
 * Single stitch with its count and color information
 */
export interface Stitch {
  type: StitchType;
  count: number;
  color?: string; // color key like 'primary', 'secondary', or hex code
  notes?: string;
}

/**
 * A complete row of stitches
 */
export interface StitchRow {
  rowNumber: number;
  stitches: Stitch[];
  totalStitches: number;
  notes?: string;
  colorChangeAtStitch?: number; // 0-indexed position where color changes
}

/**
 * Complete stitch instruction for a pattern section
 */
export interface StitchInstruction {
  rowNumber: number;
  instruction: string; // Human-readable instruction like "Rnd 1: 6 sc in magic ring (6)"
  stitchesUsed: StitchType[];
  notes?: string;
}

// ============================================================================
// BODY PARTS & DOG ANATOMY
// ============================================================================

/**
 * Named body parts for amigurumi construction
 */
export type BodyPartName =
  | 'head'
  | 'body'
  | 'frontLeg'
  | 'backLeg'
  | 'ear'
  | 'tail'
  | 'snout'
  | 'nose'
  | 'eyePatch';

/**
 * Color zone within a body part defining where specific colors are used
 */
export interface ColorZone {
  id: string;
  startRow: number;
  endRow: number;
  colorKey: string; // 'primary', 'secondary', 'tertiary', 'accent', or custom key
  description: string; // e.g., "ear tips", "belly", "back stripe"
}

/**
 * Body part definition with structure and assembly information
 */
export interface BodyPart {
  name: BodyPartName;
  rows: StitchRow[];
  colorZones: ColorZone[];
  proportions: {
    widthRatio: number; // relative to base size
    heightRatio: number;
    depthRatio?: number; // for 3D parts
  };
  quantity: number; // e.g., 4 for legs, 1 for head
  assemblyNotes: string[];
  stuffingLevel?: 'light' | 'medium' | 'firm'; // firmness of stuffing
  fastenerType?: 'sew' | 'wire' | 'joint'; // how to attach
  estimatedYardage: number;
}

// ============================================================================
// DOG BREEDS & ATTRIBUTES
// ============================================================================

/**
 * Supported dog breeds for preset patterns
 */
export type DogBreed =
  | 'labrador'
  | 'german-shepherd'
  | 'golden-retriever'
  | 'french-bulldog'
  | 'bulldog'
  | 'poodle'
  | 'beagle'
  | 'rottweiler'
  | 'dachshund'
  | 'corgi';

/**
 * Ear shape variations
 */
export type EarShape =
  | 'floppy' // long, drooping ears (Labrador, Beagle)
  | 'pointy' // erect, triangular ears (German Shepherd, Corgi)
  | 'droopy' // medium-length hanging ears (Cocker Spaniel style)
  | 'button' // small, folded ears (French Bulldog)
  | 'pendant' // long and narrow (Dachshund)
  | 'rose' // small, folded back ears (Bulldog)
  | 'flat'; // barely visible (Poodle, some Poodle mixes)

/**
 * Tail shape and carriage variations
 */
export type TailType =
  | 'curled' // tightly curled (Pug, Chow Chow)
  | 'plumed' // long and fluffy (Pomeranian, Golden Retriever)
  | 'straight' // straight and medium length (German Shepherd)
  | 'feathered' // medium with feathering (Spaniel)
  | 'docked' // very short or removed (Boxer, Rottweiler)
  | 'saber' // curved upward (Belgian Malinois)
  | 'whip' // thin and tapered (Greyhound)
  | 'flag' // carried high (Beagle)
  | 'otter'; // thick, otter-like tail (Labrador)

/**
 * Yarn size categories that affect the final amigurumi size
 */
export type SizeCategory =
  | 'tiny' // 2-3 inches
  | 'small' // 4-6 inches
  | 'medium' // 7-10 inches
  | 'large' // 11-15 inches
  | 'xlarge'; // 16+ inches

/**
 * Doll size selection for pattern generation
 */
export type DollSize = 'small' | 'medium' | 'large';

/**
 * Configuration for a specific doll size
 */
export interface SizeConfig {
  hookSize: string;
  yarnWeight: string;
  finishedHeight: string;
  bodyParts: Record<BodyPartName, BodyPart>;
}

/**
 * Types of markings and patterns on dog coat
 */
export type MarkingType =
  | 'spot'
  | 'stripe'
  | 'patch'
  | 'blaze' // white stripe on face
  | 'saddle' // dark color across back
  | 'brindle' // striped pattern
  | 'sable' // dark-tipped hairs
  | 'particolor' // two or more distinct colors
  | 'tan-points' // dark body with tan/cream points
  | 'merle' // mottled pattern
  | 'tricolor' // three-color pattern (e.g., Beagle)
  | 'dapple'; // dappled pattern with lighter spots (e.g., Dachshund)

/**
 * Location of a marking on the dog's body
 */
export interface Marking {
  type: MarkingType;
  location: BodyPartName;
  coverage: number; // 0-1 percentage of the body part
  colors: string[]; // hex codes for the marking colors
}

// ============================================================================
// BREED PRESETS
// ============================================================================

/**
 * Default yarn colors for a breed
 */
export interface BreedColors {
  primary: string; // dominant color (hex code)
  secondary?: string; // secondary color
  tertiary?: string; // tertiary color
  accent?: string; // accent color for markings
}

/**
 * Complete preset pattern for a dog breed
 */
export interface BreedPreset {
  breedId: DogBreed;
  name: string; // e.g., "Labrador Retriever"
  description: string;
  baseSize: SizeCategory;
  defaultColors: BreedColors;
  defaultEarShape: EarShape;
  defaultTailType: TailType;
  bodyParts: Record<BodyPartName, BodyPart>;
  assemblyInstructions: string[];
  estimatedHours: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  hookSize: string; // e.g., "H/8 (5mm)"
  yarnWeight: 'worsted' | 'bulky' | 'sport' | 'dk';
  totalYardageNeeded?: number;
  commonMarkings?: Marking[];
  notes?: string;
  sizes?: Record<DollSize, SizeConfig>; // Optional size-specific configurations
}

// ============================================================================
// AI ANALYSIS RESULTS
// ============================================================================

/**
 * Body proportions detected from photo analysis
 */
export interface BodyProportions {
  headToBodyRatio: number;
  legLength: number; // relative to body height
  tailLength: number;
  earSize: number; // relative to head
  snoutLength: number;
  buildType: 'stocky' | 'athletic' | 'slender' | 'massive';
}

/**
 * Distinctive features identified by AI
 */
export interface DistinctiveFeature {
  name: string; // e.g., "spot on left ear", "white chest patch"
  location: BodyPartName;
  description: string;
  confidence: number; // 0-1
}

/**
 * Per-body-part analysis from AI vision
 * Describes the specific visual characteristics of each body part
 */
export interface BodyPartAnalysis {
  partName: string; // head, body, ears, legs, tail, snout, nose
  colors: string[]; // hex codes for this part
  primaryColor: string; // dominant color hex
  markings: string[]; // description of markings on this part
  shape: string; // description of shape/style
  texture: string; // smooth, curly, fluffy, short, long, wiry
  relativeSize: number; // 0.1-1.0 relative to body
  crochetNotes: string; // specific crochet guidance for recreating this part
}

/**
 * Complete AI analysis result from photo upload
 */
export interface DogAnalysisResult {
  detectedBreed: DogBreed;
  confidenceScore: number; // 0-1
  alternativeBreeds?: Array<{
    breed: DogBreed;
    confidence: number;
  }>;
  colors: BreedColors;
  colorConfidence: number; // how confident in color detection
  markings: Marking[];
  earShape: EarShape;
  tailType: TailType;
  bodyProportions: BodyProportions;
  distinctiveFeatures: DistinctiveFeature[];
  bodyPartAnalysis?: BodyPartAnalysis[]; // detailed per-body-part analysis
  estimatedAge?: 'puppy' | 'adult' | 'senior';
  estimatedSize?: 'small' | 'medium' | 'large' | 'xlarge';
  photoUrl: string;
  analysisTimestamp: Date;
  modelVersion: string; // for version tracking
}

// ============================================================================
// PATTERN GENERATION & CUSTOMIZATION
// ============================================================================

/**
 * Difficulty level for pattern details and instructions
 */
export type DifficultyLevel = 'simplified' | 'standard' | 'detailed';

/**
 * Custom color assignments for the pattern
 */
export interface ColorAssignment {
  colorKey: string; // 'primary', 'secondary', etc.
  hexCode: string;
  yarnName?: string;
  yardageUsed?: number;
}

/**
 * Customization options applied to a pattern
 */
export interface PatternCustomizations {
  colorAssignments: ColorAssignment[];
  toggledFeatures: Record<string, boolean>; // e.g., { "ears": true, "tail": false }
  proportionAdjustments: Record<string, number>; // e.g., { "legLength": 1.1 }
  difficultyLevel: DifficultyLevel;
  hookSizeOverride?: string;
  yarnWeightOverride?: 'worsted' | 'bulky' | 'sport' | 'dk';
  sizeMultiplier: number; // 0.5 to 2.0
  notes?: string;
}

/**
 * Yarn details for materials list
 */
export interface YarnInfo {
  name: string;
  brand?: string;
  colorName: string;
  hexCode: string;
  yardage: number;
  weight: 'worsted' | 'bulky' | 'sport' | 'dk';
}

/**
 * Materials needed for the pattern
 */
export interface PatternMaterials {
  yarns: YarnInfo[];
  hookSize: string;
  hookSizeInfo?: string; // e.g., "H/8 (5mm)"
  notions: Array<{
    name: string;
    quantity: number;
    unit: string; // e.g., "pair", "pack", "yards"
  }>;
  stuffingAmount: number; // in ounces or grams
  stuffingType?: string; // e.g., "polyester fiberfill"
  additionalSupplies?: string[]; // e.g., ["embroidery thread", "stitch markers"]
  totalYardageNeeded: number;
}

/**
 * Single pattern section (e.g., Head, Body, Left Front Leg)
 */
export interface PatternSection {
  name: string;
  bodyParts: BodyPartName[];
  instructions: StitchInstruction[];
  notes?: string;
  estimatedTime: number; // in hours
  difficultyNotes?: string;
}

/**
 * Complete generated crochet pattern
 */
export interface GeneratedPattern {
  title: string;
  description: string;
  sections: PatternSection[];
  abbreviations: Record<string, string>; // e.g., { "sc": "single crochet", "inc": "increase" }
  assemblyInstructions: string[];
  assemblyDiagram?: string; // SVG or image data
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  estimatedTotalTime: number; // in hours
  notes?: string;
  generatedAt: Date;
}

// ============================================================================
// CUSTOM PATTERN (User's uploaded pattern state)
// ============================================================================

/**
 * Complete custom pattern with all metadata and generation history
 */
export interface CustomPattern {
  id: string;
  userId: string;
  name: string;
  description?: string;
  dogName?: string;
  dogPhotoUrl: string;
  dogPhotoThumbnailUrl?: string;
  breedId: DogBreed;
  analysisResult: DogAnalysisResult;
  customizations: PatternCustomizations;
  generatedPattern: GeneratedPattern;
  materials: PatternMaterials;
  editorState?: PatternEditorState;
  previewImageUrl?: string; // base64 data URL of AI-generated amigurumi preview
  exportFormats: Array<'pdf' | 'txt' | 'markdown'>;
  createdAt: Date;
  updatedAt: Date;
  lastExportedAt?: Date;
  tags?: string[];
  isTemplate?: boolean; // whether this can be used as a template for others
  visibility?: 'private' | 'shared' | 'public';
}

// ============================================================================
// PATTERN EDITOR STATE
// ============================================================================

/**
 * State of the pattern editor for saving/resuming edits
 */
export interface PatternEditorState {
  activeTab:
    | 'overview'
    | 'colors'
    | 'proportions'
    | 'sections'
    | 'materials'
    | 'assembly'
    | 'preview';
  selectedSection?: string;
  selectedBodyPart?: BodyPartName;
  expandedSections: string[];
  scrollPosition?: number;
  hasUnsavedChanges: boolean;
  lastEditedAt: Date;
  editHistory: Array<{
    timestamp: Date;
    change: string;
    undoable?: boolean;
  }>;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Request payload for photo upload and analysis
 */
export interface UploadPhotoRequest {
  photo: File | Blob;
  fileName?: string;
}

/**
 * Response from photo analysis endpoint
 */
export interface AnalyzePhotoResponse {
  success: boolean;
  data?: DogAnalysisResult;
  error?: string;
  processingTime: number; // in milliseconds
}

/**
 * Request to generate pattern from analysis
 */
export interface GeneratePatternRequest {
  analysisResult: DogAnalysisResult;
  customizations: PatternCustomizations;
  breedPresetId: DogBreed;
}

/**
 * Response from pattern generation endpoint
 */
export interface GeneratePatternResponse {
  success: boolean;
  data?: GeneratedPattern;
  materials?: PatternMaterials;
  error?: string;
  generatedAt: Date;
}

/**
 * Request to save a custom pattern
 */
export interface SavePatternRequest {
  customPattern: Omit<CustomPattern, 'id' | 'createdAt' | 'updatedAt'>;
}

/**
 * Request to export pattern in specific format
 */
export interface ExportPatternRequest {
  patternId: string;
  format: 'pdf' | 'txt' | 'markdown';
  includeImages?: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Generic response wrapper for API calls
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    timestamp: Date;
    requestId?: string;
  };
}

/**
 * Pagination helper
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// EXPORT ENUMS (for easier usage)
// ============================================================================

export enum StitchTypeEnum {
  SingleCrochet = 'sc',
  Increase = 'inc',
  Decrease = 'dec',
  HalfDoubleCrochet = 'hdc',
  DoubleCrochet = 'dc',
  Treble = 'tr',
  SlipStitch = 'slst',
  Chain = 'ch',
  FrontLoopOnly = 'FLO',
  BackLoopOnly = 'BLO',
}

export enum BodyPartNameEnum {
  Head = 'head',
  Body = 'body',
  FrontLeg = 'frontLeg',
  BackLeg = 'backLeg',
  Ear = 'ear',
  Tail = 'tail',
  Snout = 'snout',
  Nose = 'nose',
  EyePatch = 'eyePatch',
}

export enum DogBreedEnum {
  Labrador = 'labrador',
  GermanShepherd = 'german-shepherd',
  GoldenRetriever = 'golden-retriever',
  FrenchBulldog = 'french-bulldog',
  Bulldog = 'bulldog',
  Poodle = 'poodle',
  Beagle = 'beagle',
  Rottweiler = 'rottweiler',
  Dachshund = 'dachshund',
  Corgi = 'corgi',
}

export enum DifficultyLevelEnum {
  Simplified = 'simplified',
  Standard = 'standard',
  Detailed = 'detailed',
}
