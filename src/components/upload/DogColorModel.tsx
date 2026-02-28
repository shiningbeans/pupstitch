'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [pickerPos, setPickerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        svgRef.current &&
        !svgRef.current.contains(e.target as Node)
      ) {
        setSelectedRegion(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleRegionClick = (regionId: string, event: React.MouseEvent) => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setPickerPos({ x, y });
    setSelectedRegion(regionId === selectedRegion ? null : regionId);
  };

  const handleColorInput = (regionId: string, color: string) => {
    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) return;
    onColorChange({ [region.storeKey]: color });
  };

  const handleReset = (regionId: string) => {
    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) return;
    onColorChange({ [region.storeKey]: undefined });
    setSelectedRegion(null);
  };

  // Current colors
  const bodyColor = getRegionColor(REGIONS[0]);
  const faceColor = bodyColor; // linked
  const bellyColor = getRegionColor(REGIONS[2]);
  const muzzleColor = getRegionColor(REGIONS[3]);
  const noseColor = getRegionColor(REGIONS[4]);
  const earColor = getRegionColor(REGIONS[5]);
  const earInnerColor = getRegionColor(REGIONS[6]);
  const legColor = getRegionColor(REGIONS[7]);

  const selectedRegionDef = REGIONS.find((r) => r.id === selectedRegion);

  return (
    <div className="relative">
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
            </defs>

            {/* === BACK LEGS (behind body) === */}
            <g className="cursor-pointer" onClick={(e) => handleRegionClick('legs', e)}>
              {/* Back left leg */}
              <path
                d="M 95 340 Q 85 370, 80 400 Q 78 415, 90 420 L 110 420 Q 118 415, 115 400 Q 112 380, 108 340"
                fill="url(#grad-leg)"
                stroke={selectedRegion === 'legs' ? '#E8533F' : darken(legColor, 30)}
                strokeWidth={selectedRegion === 'legs' ? 2 : 0.8}
                strokeDasharray={selectedRegion === 'legs' ? '5 3' : 'none'}
              />
              {/* Back right leg */}
              <path
                d="M 192 340 Q 188 370, 185 400 Q 183 415, 190 420 L 210 420 Q 218 415, 220 400 Q 218 380, 205 340"
                fill="url(#grad-leg)"
                stroke={selectedRegion === 'legs' ? '#E8533F' : darken(legColor, 30)}
                strokeWidth={selectedRegion === 'legs' ? 2 : 0.8}
                strokeDasharray={selectedRegion === 'legs' ? '5 3' : 'none'}
              />
            </g>

            {/* === BODY / TORSO === */}
            <g className="cursor-pointer" onClick={(e) => handleRegionClick('body', e)}>
              <ellipse
                cx="150" cy="310" rx="85" ry="65"
                fill="url(#grad-body)"
                stroke={selectedRegion === 'body' ? '#E8533F' : darken(bodyColor, 30)}
                strokeWidth={selectedRegion === 'body' ? 2.5 : 1}
                strokeDasharray={selectedRegion === 'body' ? '6 3' : 'none'}
                filter="url(#dcm-shadow)"
              />
              <ellipse cx="150" cy="310" rx="83" ry="63" fill="url(#dcm-highlight)" pointerEvents="none" />
            </g>

            {/* === BELLY / CHEST patch === */}
            <g className="cursor-pointer" onClick={(e) => handleRegionClick('belly', e)}>
              <ellipse
                cx="150" cy="315" rx="45" ry="40"
                fill="url(#grad-belly)"
                stroke={selectedRegion === 'belly' ? '#E8533F' : darken(bellyColor, 20)}
                strokeWidth={selectedRegion === 'belly' ? 2 : 0.6}
                strokeDasharray={selectedRegion === 'belly' ? '5 3' : 'none'}
                filter="url(#dcm-inset)"
              />
            </g>

            {/* === FRONT LEGS === */}
            <g className="cursor-pointer" onClick={(e) => handleRegionClick('legs', e)}>
              {/* Front left leg */}
              <path
                d="M 105 355 Q 100 380, 95 405 Q 93 418, 100 422 L 118 422 Q 125 418, 123 405 Q 120 380, 118 355"
                fill="url(#grad-leg)"
                stroke={selectedRegion === 'legs' ? '#E8533F' : darken(legColor, 30)}
                strokeWidth={selectedRegion === 'legs' ? 2 : 0.8}
                strokeDasharray={selectedRegion === 'legs' ? '5 3' : 'none'}
                filter="url(#dcm-shadow)"
              />
              {/* Front right leg */}
              <path
                d="M 182 355 Q 180 380, 177 405 Q 175 418, 182 422 L 200 422 Q 207 418, 205 405 Q 202 380, 195 355"
                fill="url(#grad-leg)"
                stroke={selectedRegion === 'legs' ? '#E8533F' : darken(legColor, 30)}
                strokeWidth={selectedRegion === 'legs' ? 2 : 0.8}
                strokeDasharray={selectedRegion === 'legs' ? '5 3' : 'none'}
                filter="url(#dcm-shadow)"
              />
              {/* Paw toes - front left */}
              <g pointerEvents="none" opacity="0.3">
                <circle cx="104" cy="420" r="3" fill={darken(legColor, 20)} />
                <circle cx="110" cy="421" r="3" fill={darken(legColor, 20)} />
                <circle cx="116" cy="420" r="3" fill={darken(legColor, 20)} />
              </g>
              {/* Paw toes - front right */}
              <g pointerEvents="none" opacity="0.3">
                <circle cx="187" cy="420" r="3" fill={darken(legColor, 20)} />
                <circle cx="193" cy="421" r="3" fill={darken(legColor, 20)} />
                <circle cx="199" cy="420" r="3" fill={darken(legColor, 20)} />
              </g>
            </g>

            {/* === LEFT EAR (outer + inner) === */}
            <g className="cursor-pointer" onClick={(e) => handleRegionClick('ear-left', e)}
               style={{ transition: 'transform 200ms ease', transformOrigin: '85px 90px' }}>
              <path
                d="M 85 100 Q 30 60, 20 130 Q 15 170, 55 180 Q 75 175, 85 155"
                fill="url(#grad-ear-l)"
                stroke={selectedRegion === 'ear-left' ? '#E8533F' : darken(earColor, 40)}
                strokeWidth={selectedRegion === 'ear-left' ? 2.5 : 1.2}
                strokeDasharray={selectedRegion === 'ear-left' ? '6 3' : 'none'}
                filter="url(#dcm-shadow)"
              />
              <path
                d="M 78 110 Q 42 82, 34 135 Q 30 160, 58 168 Q 72 163, 78 148"
                fill="url(#grad-ear-inner-l)"
                stroke={selectedRegion === 'ear-inner' ? '#E8533F' : 'transparent'}
                strokeWidth={selectedRegion === 'ear-inner' ? 2 : 0}
                strokeDasharray={selectedRegion === 'ear-inner' ? '5 3' : 'none'}
                className="cursor-pointer"
                onClick={(e) => { e.stopPropagation(); handleRegionClick('ear-inner', e); }}
              />
            </g>

            {/* === RIGHT EAR (outer + inner) === */}
            <g className="cursor-pointer" onClick={(e) => handleRegionClick('ear-left', e)}
               style={{ transition: 'transform 200ms ease', transformOrigin: '215px 90px' }}>
              <path
                d="M 215 100 Q 270 60, 280 130 Q 285 170, 245 180 Q 225 175, 215 155"
                fill="url(#grad-ear-r)"
                stroke={selectedRegion === 'ear-left' ? '#E8533F' : darken(earColor, 40)}
                strokeWidth={selectedRegion === 'ear-left' ? 2.5 : 1.2}
                strokeDasharray={selectedRegion === 'ear-left' ? '6 3' : 'none'}
                filter="url(#dcm-shadow)"
              />
              <path
                d="M 222 110 Q 258 82, 266 135 Q 270 160, 242 168 Q 228 163, 222 148"
                fill="url(#grad-ear-inner-r)"
                stroke={selectedRegion === 'ear-inner' ? '#E8533F' : 'transparent'}
                strokeWidth={selectedRegion === 'ear-inner' ? 2 : 0}
                strokeDasharray={selectedRegion === 'ear-inner' ? '5 3' : 'none'}
                className="cursor-pointer"
                onClick={(e) => { e.stopPropagation(); handleRegionClick('ear-inner', e); }}
              />
            </g>

            {/* === FACE / HEAD === */}
            <g className="cursor-pointer" onClick={(e) => handleRegionClick('face', e)}>
              <ellipse
                cx="150" cy="180" rx="95" ry="105"
                fill="url(#grad-face)"
                stroke={selectedRegion === 'face' ? '#E8533F' : darken(faceColor, 40)}
                strokeWidth={selectedRegion === 'face' ? 2.5 : 1.2}
                strokeDasharray={selectedRegion === 'face' ? '6 3' : 'none'}
                filter="url(#dcm-shadow)"
              />
              <ellipse cx="150" cy="180" rx="93" ry="103" fill="url(#dcm-highlight)" pointerEvents="none" />
            </g>

            {/* === MUZZLE === */}
            <g className="cursor-pointer" onClick={(e) => handleRegionClick('muzzle', e)}>
              <ellipse
                cx="150" cy="225" rx="50" ry="42"
                fill="url(#grad-muzzle)"
                stroke={selectedRegion === 'muzzle' ? '#E8533F' : darken(muzzleColor, 30)}
                strokeWidth={selectedRegion === 'muzzle' ? 2.5 : 1}
                strokeDasharray={selectedRegion === 'muzzle' ? '5 3' : 'none'}
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
            <g className="cursor-pointer" onClick={(e) => handleRegionClick('nose', e)}>
              <path
                d="M 150 206 Q 138 204, 134 214 Q 132 221, 140 224 Q 145 226, 150 223 Q 155 226, 160 224 Q 168 221, 166 214 Q 162 204, 150 206 Z"
                fill="url(#grad-nose)"
                stroke={selectedRegion === 'nose' ? '#E8533F' : darken(noseColor, 30)}
                strokeWidth={selectedRegion === 'nose' ? 2 : 0.8}
                strokeDasharray={selectedRegion === 'nose' ? '4 2' : 'none'}
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

        {/* Color picker popover */}
        {selectedRegion && selectedRegionDef && (
          <div
            ref={pickerRef}
            className="absolute z-50 bg-white rounded-xl shadow-xl border border-stone-200 p-3 min-w-[180px]"
            style={{
              left: Math.min(pickerPos.x, 160),
              top: Math.min(pickerPos.y + 10, 360),
            }}
          >
            <div className="text-xs font-semibold text-stone-700 mb-1">
              {selectedRegionDef.label}
            </div>
            <div className="text-[10px] text-stone-400 mb-2">
              {selectedRegionDef.productPart}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={getRegionColor(selectedRegionDef)}
                onChange={(e) => handleColorInput(selectedRegion, e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-stone-200 p-0.5"
              />
              <div className="flex-1">
                <div className="text-xs font-mono text-stone-600">
                  {getRegionColor(selectedRegionDef).toUpperCase()}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleReset(selectedRegion)}
              className="w-full text-[10px] text-stone-400 hover:text-stone-600 transition-colors py-1"
            >
              Reset to detected
            </button>
          </div>
        )}
      </div>

      {/* Legend grid */}
      <div className="mt-4 grid grid-cols-4 gap-1.5 max-w-sm mx-auto">
        {REGIONS.map((region) => {
          const color = getRegionColor(region);
          const isActive = selectedRegion === region.id;
          return (
            <button
              key={region.id}
              onClick={() => {
                setPickerPos({ x: 100, y: 200 });
                setSelectedRegion(isActive ? null : region.id);
              }}
              className={`flex items-center gap-1.5 p-1.5 rounded-lg text-left transition-all duration-150 ${
                isActive
                  ? 'bg-orange-50 border border-orange-200 shadow-sm'
                  : 'bg-white/60 border border-stone-100 hover:border-stone-200 hover:bg-white/80'
              }`}
            >
              <div
                className="w-4 h-4 rounded-md border border-stone-200/80 flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="min-w-0">
                <div className="text-[9px] font-medium text-stone-700 truncate leading-tight">
                  {region.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
