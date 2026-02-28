/**
 * LeashBuddy Product Types
 * Manufacturing specs, embroidery, BOM, and product customization types
 */

// ============================================================================
// PRODUCT TYPE
// ============================================================================

export type ProductType = 'leash-buddy' | 'pupstitch' | 'both';

// ============================================================================
// EMBROIDERY SPECIFICATIONS
// ============================================================================

export type EmbroideryLocation =
  | 'front-flap'     // Main face embroidery on the opening flap
  | 'paw-left'       // Left paw print on front body
  | 'paw-right'      // Right paw print on front body
  | 'back-logo'      // LeashBuddy logo silhouette on back
  | 'ear-patch-left'  // Optional marking on left ear
  | 'ear-patch-right'; // Optional marking on right ear

export interface EmbroiderySpec {
  location: EmbroideryLocation;
  designDescription: string;   // Human-readable description for manufacturer
  threadColors: Array<{
    hex: string;
    name: string;              // e.g., "Black", "Chocolate Brown"
    usage: string;             // e.g., "eyes", "nose outline", "smile line"
  }>;
  estimatedStitchCount: number;
  dimensions: {
    widthMm: number;
    heightMm: number;
  };
  notes?: string;
}

// ============================================================================
// FABRIC SPECIFICATIONS
// ============================================================================

export type FabricMaterial = 'nylon' | 'canvas' | 'polyester' | 'fleece' | 'mesh';

export type FabricPart =
  | 'main-body'
  | 'front-flap'
  | 'back-panel'
  | 'interior-lining'
  | 'ear-outer-left'
  | 'ear-outer-right'
  | 'ear-inner-left'
  | 'ear-inner-right'
  | 'binding-edge'
  | 'bottom-compartment'
  | 'paw-accent-left'
  | 'paw-accent-right';

export interface FabricColorSpec {
  part: FabricPart;
  partLabel: string;           // Human-readable: "Main Body", "Left Ear (Outer)"
  hex: string;
  colorName: string;           // e.g., "Cream", "Chocolate Brown"
  material: FabricMaterial;
  pantoneRef?: string;         // Pantone reference for manufacturing
  notes?: string;
}

// ============================================================================
// BILL OF MATERIALS
// ============================================================================

export type BOMCategory = 'fabric' | 'hardware' | 'thread' | 'notions' | 'packaging';

export interface BOMItem {
  name: string;
  category: BOMCategory;
  quantity: number;
  unit: string;               // "piece", "cm", "meter", "roll", "pack"
  material?: string;          // e.g., "zinc alloy", "polyester"
  specification?: string;     // e.g., "3.5cm width", "#5 nylon coil"
  colorHex?: string;          // Color if applicable
  estimatedCostUSD?: number;  // Per-unit cost estimate
  supplierNotes?: string;
}

// ============================================================================
// PRODUCT SIZE
// ============================================================================

export type LeashBuddySize = 'small' | 'medium' | 'large';

export interface ProductDimensions {
  heightCm: number;
  widthCm: number;
  depthCm: number;
  faceWidthCm: number;
  faceHeightCm: number;
}

/**
 * Fixed LeashBuddy dimensions — single standard size based on poop bag roll (3.5cm diameter).
 * Small/medium/large sizing is only for PupStitch crochet patterns.
 */
export const FIXED_LEASHBUDDY_DIMENSIONS: ProductDimensions = {
  heightCm: 9.5,
  widthCm: 6.5,
  depthCm: 5.5,
  faceWidthCm: 5,
  faceHeightCm: 3.7,
};

/** @deprecated Use FIXED_LEASHBUDDY_DIMENSIONS for LeashBuddy. Kept for PupStitch size system. */
export const PRODUCT_DIMENSIONS: Record<LeashBuddySize, ProductDimensions> = {
  small: { heightCm: 8, widthCm: 5.5, depthCm: 4.5, faceWidthCm: 4, faceHeightCm: 3 },
  medium: FIXED_LEASHBUDDY_DIMENSIONS,
  large: { heightCm: 11.5, widthCm: 7.5, depthCm: 6.5, faceWidthCm: 6, faceHeightCm: 4.5 },
};

// ============================================================================
// EAR STYLE (mapped from AI ear shape)
// ============================================================================

export type ProductEarStyle = 'floppy' | 'pointy' | 'button' | 'rose';

// ============================================================================
// LEASHBUDDY PRODUCT SPEC (complete manufacturing specification)
// ============================================================================

export interface LeashBuddyProductSpec {
  // Identity
  productName: string;        // e.g., "Luna's Golden Retriever LeashBuddy"
  breedName: string;          // e.g., "Golden Retriever"
  dogName?: string;

  // Design
  productSize: LeashBuddySize;
  dimensions: ProductDimensions;
  earStyle: ProductEarStyle;

  // Specifications
  embroiderySpecs: EmbroiderySpec[];
  fabricColors: FabricColorSpec[];
  manufacturingBOM: BOMItem[];
  assemblyNotes: string[];

  // Preview
  previewImageUrl?: string;   // 3D nanobannana render (base64 data URL)

  // Metadata
  generatedAt: Date;
  specVersion: string;        // For tracking spec format changes
}

// ============================================================================
// PRODUCT CUSTOMIZATIONS (user-adjustable settings)
// ============================================================================

export type ProductMaterial = 'canvas' | 'leather' | 'faux-leather' | 'neoprene' | 'cordura';

export type EarSize = 'small' | 'medium' | 'large';

export interface LeashBuddyCustomizations {
  material: ProductMaterial;
  earStyle: ProductEarStyle;
  earSize: EarSize;
  // Per-body-part color overrides (optional — AI-detected colors used as defaults)
  bodyColor?: string;
  earColor?: string;
  earInnerColor?: string;
  muzzleColor?: string;
  noseColor?: string;
  bellyColor?: string;
  legColor?: string;
  bindingColor?: string;
  flapColor?: string;
  liningColor?: string;
  includeNameEmbroidery: boolean;
  notes?: string;
}

export const DEFAULT_LEASHBUDDY_CUSTOMIZATIONS: LeashBuddyCustomizations = {
  material: 'canvas',
  earStyle: 'floppy',
  earSize: 'medium',
  includeNameEmbroidery: false,
};

export const MATERIAL_OPTIONS: Array<{ id: ProductMaterial; label: string; description: string }> = [
  { id: 'canvas', label: 'Canvas', description: 'Durable woven cotton canvas — classic & breathable' },
  { id: 'cordura', label: 'Cordura Nylon', description: 'Military-grade nylon — ultra-durable & water-resistant' },
  { id: 'leather', label: 'Genuine Leather', description: 'Premium full-grain leather — ages beautifully' },
  { id: 'faux-leather', label: 'Vegan Leather', description: 'PU faux leather — cruelty-free & stylish' },
  { id: 'neoprene', label: 'Neoprene', description: 'Soft & flexible — waterproof & easy to clean' },
];

export const EAR_SIZE_OPTIONS: Array<{ id: EarSize; label: string; description: string }> = [
  { id: 'small', label: 'Small', description: 'Subtle ears, barely extend past body' },
  { id: 'medium', label: 'Medium', description: 'Standard sized decorative ears' },
  { id: 'large', label: 'Large', description: 'Prominent ears for maximum character' },
];

// Legacy alias
export interface ProductCustomizations {
  productSize: LeashBuddySize;
  primaryColorOverride?: string;
  secondaryColorOverride?: string;
  earStyleOverride?: ProductEarStyle;
  includeNameEmbroidery?: boolean;
  notes?: string;
}
