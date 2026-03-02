'use client';

import { useRef, useCallback } from 'react';
import type { DogAnalysisResult } from '@/types';
import type { LeashBuddyCustomizations } from '@/types/product-types';

// ─── Region definitions ──────────────────────────────────────────────
interface RegionDef {
  id: string;
  label: string;
  productPart: string;
  storeKey: keyof LeashBuddyCustomizations;
  defaultColor: string;
  analysisKey?: string;
  analysisColorKey?: 'primary' | 'secondary' | 'tertiary' | 'accent';
}

const REGIONS: RegionDef[] = [
  {
    id: 'body',
    label: 'Body',
    productPart: 'Pouch body fabric',
    storeKey: 'bodyColor',
    defaultColor: '#C4956A',
    analysisKey: 'body',
    analysisColorKey: 'primary',
  },
  {
    id: 'face',
    label: 'Face',
    productPart: 'Front flap',
    storeKey: 'bodyColor',
    defaultColor: '#C4956A',
    analysisKey: 'head',
    analysisColorKey: 'primary',
  },
  {
    id: 'belly',
    label: 'Chest / Belly',
    productPart: 'Marking area',
    storeKey: 'bellyColor',
    defaultColor: '#E8D5C0',
    analysisKey: 'body',
    analysisColorKey: 'secondary',
  },
  {
    id: 'muzzle',
    label: 'Muzzle',
    productPart: 'Muzzle applique',
    storeKey: 'muzzleColor',
    defaultColor: '#F5E6D3',
    analysisKey: 'snout',
  },
  {
    id: 'nose',
    label: 'Nose',
    productPart: 'Nose embroidery',
    storeKey: 'noseColor',
    defaultColor: '#1A1A1A',
    analysisKey: 'nose',
  },
  {
    id: 'ear-left',
    label: 'Ears (outer)',
    productPart: 'Ear fabric',
    storeKey: 'earColor',
    defaultColor: '#8B6914',
    analysisKey: 'ears',
    analysisColorKey: 'secondary',
  },
  {
    id: 'ear-inner',
    label: 'Ears (inner)',
    productPart: 'Ear lining',
    storeKey: 'earInnerColor',
    defaultColor: '#F0D4B8',
  },
  {
    id: 'legs',
    label: 'Legs / Paws',
    productPart: 'Paw accents',
    storeKey: 'legColor',
    defaultColor: '#B8865A',
    analysisKey: 'frontLeg',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────
function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.min(255, r + amount);
  const ng = Math.min(255, g + amount);
  const nb = Math.min(255, b + amount);
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

function darken(hex: string, amount: number): string {
  return lighten(hex, -amount);
}

// ─── Component ───────────────────────────────────────────────────────
interface DogColorModelProps {
  analysisResult: DogAnalysisResult | null;
  customizations: LeashBuddyCustomizations;
  onColorChange: (updates: Partial<LeashBuddyCustomizations>) => void;
}

export default function DogColorModel({
  analysisResult,
  customizations,
  onColorChange,
}: DogColorModelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  // Hidden color inputs for each region — one per region + one per extra color slot
  const colorInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getRegionColor = useCallback(
    (region: RegionDef): string => {
      const override = customizations[region.storeKey] as string | undefined;
      if (override) return override;

      if (analysisResult) {
        if (region.analysisKey && analysisResult.bodyPartAnalysis) {
          const part = analysisResult.bodyPartAnalysis.find(
            (bp) => bp.partName === region.analysisKey
          );
          if (part?.primaryColor) return part.primaryColor;
        }
        if (region.analysisColorKey && analysisResult.colors) {
          const c = analysisResult.colors[region.analysisColorKey];
          if (c) return c;
        }
      }

      return region.defaultColor;
    },
    [analysisResult, customizations]
  );

  // Get all colors for a region (primary + extras from regionColors)
  const getRegionColors = useCallback(
    (region: RegionDef): string[] => {
      const primary = getRegionColor(region);
      const extras = customizations.regionColors?.[region.id] || [];
      return [primary, ...extras];
    },
    [getRegionColor, customizations.regionColors]
  );

  // Click on SVG region or legend → immediately open native color picker
  const openColorPicker = (regionId: string, colorIndex: number = 0) => {
    const key = `${regionId}-${colorIndex}`;
    const input = colorInputRefs.current[key];
    if (input) {
      input.click();
    }
  };

  const handleColorChange = (regionId: string, colorIndex: number, newColor: string) => {
    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) return;

    if (colorIndex === 0) {
      // Primary color — update the store key directly
      onColorChange({ [region.storeKey]: newColor });
    } else {
      // Extra color — update regionColors
      const current = { ...(customizations.regionColors || {}) };
      const extras = [...(current[regionId] || [])];
      extras[colorIndex - 1] = newColor;
      current[regionId] = extras;
      onColorChange({ regionColors: current });
    }
  };

  const addExtraColor = (regionId: string) => {
    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) return;
    const primary = getRegionColor(region);
    const current = { ...(customizations.regionColors || {}) };
    const extras = [...(current[regionId] || [])];
    if (extras.length >= 3) return; // max 4 colors total
    extras.push(darken(primary, 40)); // start with a darker variant
    current[regionId] = extras;
    onColorChange({ regionColors: current });
  };

  const removeExtraColor = (regionId: string, extraIndex: number) => {
    const current = { ...(customizations.regionColors || {}) };
    const extras = [...(current[regionId] || [])];
    extras.splice(extraIndex, 1);
    if (extras.length === 0) {
      delete current[regionId];
    } else {
      current[regionId] = extras;
    }
    onColorChange({ regionColors: current });
  };

  // Build SVG fill — stripe pattern for multi-color regions
  const buildFillId = (regionId: string, colors: string[]): string => {
    if (colors.length <= 1) return '';
    return `pattern-${regionId}`;
  };

  // Current colors
  const bodyColor = getRegionColor(REGIONS[0]);
  const faceColor = bodyColor;
  const bellyColor = getRegionColor(REGIONS[2]);
  const muzzleColor = getRegionColor(REGIONS[3]);
  const noseColor = getRegionColor(REGIONS[4]);
  const earColor = getRegionColor(REGIONS[5]);
  const earInnerColor = getRegionColor(REGIONS[6]);
  const legColor = getRegionColor(REGIONS[7]);

  // Multi-color arrays per region
  const bodyColors = getRegionColors(REGIONS[0]);
  const bellyColors = getRegionColors(REGIONS[2]);
  const earColors = getRegionColors(REGIONS[5]);
  const legColors = getRegionColors(REGIONS[7]);

  // Determine if a region is multi-color and what fill to use
  const getFill = (regionId: string, colors: string[], gradientId: string): string => {
    const patternId = buildFillId(regionId, colors);
    return patternId ? `url(#${patternId})` : `url(#${gradientId})`;
  };

  return (
    <div className="relative">
      {/* Hidden color inputs — one per region per color slot */}
      <div className="sr-only" aria-hidden="true">
        {REGIONS.map((region) => {
          const colors = getRegionColors(region);
          return colors.map((color, idx) => (
            <input
              key={`${region.id}-${idx}`}
              ref={(el) => { colorInputRefs.current[`${region.id}-${idx}`] = el; }}
              type="color"
              value={color}
              onChange={(e) => handleColorChange(region.id, idx, e.target.value)}
              tabIndex={-1}
            />
          ));
        })}
      </div>

      <div
        className="relative mx-auto"
        style={{ perspective: '800px', maxWidth: '300px' }}
      >
        <div style={{ transform: 'rotateX(2deg)', transformStyle: 'preserve-3d' }}>
          <svg
            ref={svgRef}
            viewBox="0 0 300 440"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto drop-shadow-lg"
          >
            <defs>
              <filter id="dcm-shadow" x="-10%" y="-10%" width="130%" height="130%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                <feOffset dx="0" dy="4" result="shadow" />
                <feComponentTransfer><feFuncA type="linear" slope="0.2" /></feComponentTransfer>
                <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="dcm-inset" x="-5%" y="-5%" width="110%" height="110%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="0" dy="2" />
                <feComposite operator="out" in2="SourceAlpha" />
                <feComponentTransfer><feFuncA type="linear" slope="0.12" /></feComponentTransfer>
                <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode /></feMerge>
              </filter>
              <radialGradient id="dcm-highlight" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="white" stopOpacity="0.2" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>

              {/* Per-region gradients */}
              <radialGradient id="grad-body" cx="45%" cy="35%" r="60%">
                <stop offset="0%" stopColor={lighten(bodyColor, 25)} />
                <stop offset="100%" stopColor={darken(bodyColor, 15)} />
              </radialGradient>
              <radialGradient id="grad-face" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor={lighten(faceColor, 30)} />
                <stop offset="100%" stopColor={darken(faceColor, 20)} />
              </radialGradient>
              <radialGradient id="grad-belly" cx="50%" cy="30%" r="60%">
                <stop offset="0%" stopColor={lighten(bellyColor, 20)} />
                <stop offset="100%" stopColor={darken(bellyColor, 10)} />
              </radialGradient>
              <radialGradient id="grad-muzzle" cx="45%" cy="30%" r="60%">
                <stop offset="0%" stopColor={lighten(muzzleColor, 20)} />
                <stop offset="100%" stopColor={darken(muzzleColor, 15)} />
              </radialGradient>
              <radialGradient id="grad-ear-l" cx="55%" cy="35%" r="60%">
                <stop offset="0%" stopColor={lighten(earColor, 20)} />
                <stop offset="100%" stopColor={darken(earColor, 25)} />
              </radialGradient>
              <radialGradient id="grad-ear-r" cx="45%" cy="35%" r="60%">
                <stop offset="0%" stopColor={lighten(earColor, 20)} />
                <stop offset="100%" stopColor={darken(earColor, 25)} />
              </radialGradient>
              <radialGradient id="grad-ear-inner-l" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor={lighten(earInnerColor, 15)} />
                <stop offset="100%" stopColor={darken(earInnerColor, 10)} />
              </radialGradient>
              <radialGradient id="grad-ear-inner-r" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor={lighten(earInnerColor, 15)} />
                <stop offset="100%" stopColor={darken(earInnerColor, 10)} />
              </radialGradient>
              <radialGradient id="grad-nose" cx="45%" cy="35%" r="55%">
                <stop offset="0%" stopColor={lighten(noseColor, 15)} />
                <stop offset="100%" stopColor={noseColor} />
              </radialGradient>
              <radialGradient id="grad-leg" cx="45%" cy="35%" r="60%">
                <stop offset="0%" stopColor={lighten(legColor, 20)} />
                <stop offset="100%" stopColor={darken(legColor, 20)} />
              </radialGradient>

              {/* Multi-color stripe patterns */}
              {bodyColors.length > 1 && (
                <pattern id="pattern-body" width={bodyColors.length * 12} height="1" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  {bodyColors.map((c, i) => (
                    <rect key={i} x={i * 12} y="0" width="12" height="1" fill={c} />
                  ))}
                </pattern>
              )}
              {bellyColors.length > 1 && (
                <pattern id="pattern-belly" width={bellyColors.length * 10} height="1" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
                  {bellyColors.map((c, i) => (
                    <rect key={i} x={i * 10} y="0" width="10" height="1" fill={c} />
                  ))}
                </pattern>
              )}
              {earColors.length > 1 && (
                <pattern id="pattern-ear-left" width={earColors.length * 8} height="1" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
                  {earColors.map((c, i) => (
                    <rect key={i} x={i * 8} y="0" width="8" height="1" fill={c} />
                  ))}
                </pattern>
              )}
              {legColors.length > 1 && (
                <pattern id="pattern-legs" width={legColors.length * 8} height="1" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
                  {legColors.map((c, i) => (
                    <rect key={i} x={i * 8} y="0" width="8" height="1" fill={c} />
                  ))}
                </pattern>
              )}
            </defs>

            {/* === BACK LEGS (behind body) === */}
            <g className="cursor-pointer" onClick={() => openColorPicker('legs')}>
              <path
                d="M 95 340 Q 85 370, 80 400 Q 78 415, 90 420 L 110 420 Q 118 415, 115 400 Q 112 380, 108 340"
                fill={getFill('legs', legColors, 'grad-leg')}
                stroke={darken(legColor, 30)}
                strokeWidth="0.8"
              />
              <path
                d="M 192 340 Q 188 370, 185 400 Q 183 415, 190 420 L 210 420 Q 218 415, 220 400 Q 218 380, 205 340"
                fill={getFill('legs', legColors, 'grad-leg')}
                stroke={darken(legColor, 30)}
                strokeWidth="0.8"
              />
            </g>

            {/* === BODY / TORSO === */}
            <g className="cursor-pointer" onClick={() => openColorPicker('body')}>
              <ellipse
                cx="150" cy="310" rx="85" ry="65"
                fill={getFill('body', bodyColors, 'grad-body')}
                stroke={darken(bodyColor, 30)}
                strokeWidth="1"
                filter="url(#dcm-shadow)"
              />
              <ellipse cx="150" cy="310" rx="83" ry="63" fill="url(#dcm-highlight)" pointerEvents="none" />
            </g>

            {/* === BELLY / CHEST patch === */}
            <g className="cursor-pointer" onClick={() => openColorPicker('belly')}>
              <ellipse
                cx="150" cy="315" rx="45" ry="40"
                fill={getFill('belly', bellyColors, 'grad-belly')}
                stroke={darken(bellyColor, 20)}
                strokeWidth="0.6"
                filter="url(#dcm-inset)"
              />
            </g>

            {/* === FRONT LEGS === */}
            <g className="cursor-pointer" onClick={() => openColorPicker('legs')}>
              <path
                d="M 105 355 Q 100 380, 95 405 Q 93 418, 100 422 L 118 422 Q 125 418, 123 405 Q 120 380, 118 355"
                fill={getFill('legs', legColors, 'grad-leg')}
                stroke={darken(legColor, 30)}
                strokeWidth="0.8"
                filter="url(#dcm-shadow)"
              />
              <path
                d="M 182 355 Q 180 380, 177 405 Q 175 418, 182 422 L 200 422 Q 207 418, 205 405 Q 202 380, 195 355"
                fill={getFill('legs', legColors, 'grad-leg')}
                stroke={darken(legColor, 30)}
                strokeWidth="0.8"
                filter="url(#dcm-shadow)"
              />
              {/* Paw toes */}
              <g pointerEvents="none" opacity="0.3">
                <circle cx="104" cy="420" r="3" fill={darken(legColor, 20)} />
                <circle cx="110" cy="421" r="3" fill={darken(legColor, 20)} />
                <circle cx="116" cy="420" r="3" fill={darken(legColor, 20)} />
                <circle cx="187" cy="420" r="3" fill={darken(legColor, 20)} />
                <circle cx="193" cy="421" r="3" fill={darken(legColor, 20)} />
                <circle cx="199" cy="420" r="3" fill={darken(legColor, 20)} />
              </g>
            </g>

            {/* === LEFT EAR (outer + inner) === */}
            <g className="cursor-pointer" onClick={() => openColorPicker('ear-left')}
               style={{ transition: 'transform 200ms ease', transformOrigin: '85px 90px' }}>
              <path
                d="M 85 100 Q 30 60, 20 130 Q 15 170, 55 180 Q 75 175, 85 155"
                fill={getFill('ear-left', earColors, 'grad-ear-l')}
                stroke={darken(earColor, 40)}
                strokeWidth="1.2"
                filter="url(#dcm-shadow)"
              />
              <path
                d="M 78 110 Q 42 82, 34 135 Q 30 160, 58 168 Q 72 163, 78 148"
                fill="url(#grad-ear-inner-l)"
                stroke="transparent"
                strokeWidth="0"
                className="cursor-pointer"
                onClick={(e) => { e.stopPropagation(); openColorPicker('ear-inner'); }}
              />
            </g>

            {/* === RIGHT EAR (outer + inner) === */}
            <g className="cursor-pointer" onClick={() => openColorPicker('ear-left')}
               style={{ transition: 'transform 200ms ease', transformOrigin: '215px 90px' }}>
              <path
                d="M 215 100 Q 270 60, 280 130 Q 285 170, 245 180 Q 225 175, 215 155"
                fill={getFill('ear-left', earColors, 'grad-ear-r')}
                stroke={darken(earColor, 40)}
                strokeWidth="1.2"
                filter="url(#dcm-shadow)"
              />
              <path
                d="M 222 110 Q 258 82, 266 135 Q 270 160, 242 168 Q 228 163, 222 148"
                fill="url(#grad-ear-inner-r)"
                stroke="transparent"
                strokeWidth="0"
                className="cursor-pointer"
                onClick={(e) => { e.stopPropagation(); openColorPicker('ear-inner'); }}
              />
            </g>

            {/* === FACE / HEAD === */}
            <g className="cursor-pointer" onClick={() => openColorPicker('face')}>
              <ellipse
                cx="150" cy="180" rx="95" ry="105"
                fill="url(#grad-face)"
                stroke={darken(faceColor, 40)}
                strokeWidth="1.2"
                filter="url(#dcm-shadow)"
              />
              <ellipse cx="150" cy="180" rx="93" ry="103" fill="url(#dcm-highlight)" pointerEvents="none" />
            </g>

            {/* === MUZZLE === */}
            <g className="cursor-pointer" onClick={() => openColorPicker('muzzle')}>
              <ellipse
                cx="150" cy="225" rx="50" ry="42"
                fill="url(#grad-muzzle)"
                stroke={darken(muzzleColor, 30)}
                strokeWidth="1"
                filter="url(#dcm-inset)"
              />
            </g>

            {/* === EYES (decorative) === */}
            <g pointerEvents="none">
              <ellipse cx="118" cy="168" rx="12" ry="13" fill="#1a1a1a" />
              <ellipse cx="114" cy="164" rx="4" ry="4.5" fill="white" opacity="0.8" />
              <ellipse cx="182" cy="168" rx="12" ry="13" fill="#1a1a1a" />
              <ellipse cx="178" cy="164" rx="4" ry="4.5" fill="white" opacity="0.8" />
            </g>

            {/* === NOSE === */}
            <g className="cursor-pointer" onClick={() => openColorPicker('nose')}>
              <path
                d="M 150 206 Q 138 204, 134 214 Q 132 221, 140 224 Q 145 226, 150 223 Q 155 226, 160 224 Q 168 221, 166 214 Q 162 204, 150 206 Z"
                fill="url(#grad-nose)"
                stroke={darken(noseColor, 30)}
                strokeWidth="0.8"
              />
              <ellipse cx="148" cy="211" rx="5" ry="3" fill="white" opacity="0.15" />
            </g>

            {/* === MOUTH (smiling upward semicircle) === */}
            <g pointerEvents="none">
              <path
                d="M 138 232 Q 150 246, 162 232"
                fill="none"
                stroke="#4a3728"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>

            {/* Whisker dots */}
            <g pointerEvents="none" opacity="0.4">
              <circle cx="115" cy="228" r="1.5" fill="#4a3728" />
              <circle cx="108" cy="222" r="1.5" fill="#4a3728" />
              <circle cx="110" cy="235" r="1.5" fill="#4a3728" />
              <circle cx="185" cy="228" r="1.5" fill="#4a3728" />
              <circle cx="192" cy="222" r="1.5" fill="#4a3728" />
              <circle cx="190" cy="235" r="1.5" fill="#4a3728" />
            </g>

            {/* === TAIL (behind body, decorative) === */}
            <g pointerEvents="none">
              <path
                d="M 230 280 Q 260 260, 270 230 Q 275 215, 265 220 Q 255 230, 235 270"
                fill={darken(bodyColor, 10)}
                stroke={darken(bodyColor, 35)}
                strokeWidth="0.8"
                opacity="0.8"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Legend — each row is a region with color swatches */}
      <div className="mt-4 space-y-1.5 max-w-sm mx-auto">
        {REGIONS.map((region) => {
          const colors = getRegionColors(region);
          const extras = customizations.regionColors?.[region.id] || [];
          const canAddMore = extras.length < 3;
          return (
            <div
              key={region.id}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-white/60 border border-stone-100 hover:border-stone-200 transition-colors"
            >
              {/* Region label */}
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-stone-700 truncate leading-tight">
                  {region.label}
                </div>
                <div className="text-[9px] text-stone-400 truncate">
                  {region.productPart}
                </div>
              </div>

              {/* Color swatches — each clickable to open native picker */}
              <div className="flex items-center gap-1">
                {colors.map((color, idx) => (
                  <div key={idx} className="relative group">
                    <button
                      onClick={() => openColorPicker(region.id, idx)}
                      className="w-7 h-7 rounded-md border-2 border-stone-200/80 hover:border-brand-coral transition-colors cursor-pointer shadow-sm"
                      style={{ backgroundColor: color }}
                      title={`${idx === 0 ? 'Primary' : `Color ${idx + 1}`}: ${color} — click to change`}
                    />
                    {/* Remove button for extra colors */}
                    {idx > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExtraColor(region.id, idx - 1);
                        }}
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-stone-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove this color"
                      >
                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}

                {/* Add color button */}
                {canAddMore && (
                  <button
                    onClick={() => addExtraColor(region.id)}
                    className="w-7 h-7 rounded-md border-2 border-dashed border-stone-200 hover:border-brand-coral text-stone-300 hover:text-brand-coral flex items-center justify-center transition-colors"
                    title="Add another color"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-stone-400 mt-3">
        Click any part of the dog or a color swatch to change it. Use + to add markings.
      </p>
    </div>
  );
}
