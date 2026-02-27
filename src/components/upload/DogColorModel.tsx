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
  analysisKey?: string; // bodyPartAnalysis partName to pull color from
  analysisColorKey?: 'primary' | 'secondary' | 'tertiary' | 'accent';
}

const REGIONS: RegionDef[] = [
  {
    id: 'face',
    label: 'Face',
    productPart: 'Pouch body',
    storeKey: 'bodyColor',
    defaultColor: '#C4956A',
    analysisKey: 'head',
    analysisColorKey: 'primary',
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

  // Get color for a region: user override → analysis → default
  const getRegionColor = useCallback(
    (region: RegionDef): string => {
      // User override first
      const override = customizations[region.storeKey] as string | undefined;
      if (override) return override;

      // Analysis-derived
      if (analysisResult) {
        // Try bodyPartAnalysis
        if (region.analysisKey && analysisResult.bodyPartAnalysis) {
          const part = analysisResult.bodyPartAnalysis.find(
            (bp) => bp.partName === region.analysisKey
          );
          if (part?.primaryColor) return part.primaryColor;
        }
        // Try top-level colors
        if (region.analysisColorKey && analysisResult.colors) {
          const c = analysisResult.colors[region.analysisColorKey];
          if (c) return c;
        }
      }

      return region.defaultColor;
    },
    [analysisResult, customizations]
  );

  // Close picker on outside click
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
    // Position picker near click point
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
    // Remove the override so it falls back to analysis/default
    onColorChange({ [region.storeKey]: undefined });
    setSelectedRegion(null);
  };

  // Current colors for each region
  const faceColor = getRegionColor(REGIONS[0]);
  const muzzleColor = getRegionColor(REGIONS[1]);
  const noseColor = getRegionColor(REGIONS[2]);
  const earColor = getRegionColor(REGIONS[3]);
  const earInnerColor = getRegionColor(REGIONS[4]);

  const selectedRegionDef = REGIONS.find((r) => r.id === selectedRegion);

  return (
    <div className="relative">
      {/* 3D Container */}
      <div
        className="relative mx-auto"
        style={{
          perspective: '800px',
          maxWidth: '280px',
        }}
      >
        <div
          style={{
            transform: 'rotateX(3deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 300 330"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto drop-shadow-lg"
          >
            <defs>
              {/* Shadow filter */}
              <filter id="dcm-shadow" x="-10%" y="-10%" width="130%" height="130%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                <feOffset dx="0" dy="4" result="shadow" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.2" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Inner shadow for depth */}
              <filter id="dcm-inset" x="-5%" y="-5%" width="110%" height="110%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="0" dy="2" />
                <feComposite operator="out" in2="SourceAlpha" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.15" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode />
                </feMerge>
              </filter>

              {/* Highlight gradient overlay */}
              <radialGradient id="dcm-highlight" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="white" stopOpacity="0.25" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>

              {/* Per-region gradients */}
              <radialGradient id="grad-face" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor={lighten(faceColor, 30)} />
                <stop offset="100%" stopColor={darken(faceColor, 20)} />
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
            </defs>

            {/* === LEFT EAR (outer) === */}
            <g
              className="cursor-pointer"
              onClick={(e) => handleRegionClick('ear-left', e)}
              style={{ transition: 'transform 200ms ease', transformOrigin: '85px 90px' }}
            >
              <path
                d="M 85 90 Q 30 50, 20 120 Q 15 165, 55 175 Q 75 170, 85 145"
                fill="url(#grad-ear-l)"
                stroke={selectedRegion === 'ear-left' ? '#3b82f6' : darken(earColor, 40)}
                strokeWidth={selectedRegion === 'ear-left' ? 2.5 : 1.2}
                strokeDasharray={selectedRegion === 'ear-left' ? '6 3' : 'none'}
                filter="url(#dcm-shadow)"
              />
              {/* inner ear */}
              <path
                d="M 78 100 Q 42 72, 34 125 Q 30 155, 58 163 Q 72 158, 78 140"
                fill="url(#grad-ear-inner-l)"
                stroke={selectedRegion === 'ear-inner' ? '#3b82f6' : 'transparent'}
                strokeWidth={selectedRegion === 'ear-inner' ? 2 : 0}
                strokeDasharray={selectedRegion === 'ear-inner' ? '5 3' : 'none'}
                className="cursor-pointer"
                onClick={(e) => { e.stopPropagation(); handleRegionClick('ear-inner', e); }}
              />
            </g>

            {/* === RIGHT EAR (outer) === */}
            <g
              className="cursor-pointer"
              onClick={(e) => handleRegionClick('ear-left', e)}
              style={{ transition: 'transform 200ms ease', transformOrigin: '215px 90px' }}
            >
              <path
                d="M 215 90 Q 270 50, 280 120 Q 285 165, 245 175 Q 225 170, 215 145"
                fill="url(#grad-ear-r)"
                stroke={selectedRegion === 'ear-left' ? '#3b82f6' : darken(earColor, 40)}
                strokeWidth={selectedRegion === 'ear-left' ? 2.5 : 1.2}
                strokeDasharray={selectedRegion === 'ear-left' ? '6 3' : 'none'}
                filter="url(#dcm-shadow)"
              />
              {/* inner ear */}
              <path
                d="M 222 100 Q 258 72, 266 125 Q 270 155, 242 163 Q 228 158, 222 140"
                fill="url(#grad-ear-inner-r)"
                stroke={selectedRegion === 'ear-inner' ? '#3b82f6' : 'transparent'}
                strokeWidth={selectedRegion === 'ear-inner' ? 2 : 0}
                strokeDasharray={selectedRegion === 'ear-inner' ? '5 3' : 'none'}
                className="cursor-pointer"
                onClick={(e) => { e.stopPropagation(); handleRegionClick('ear-inner', e); }}
              />
            </g>

            {/* === FACE === */}
            <g
              className="cursor-pointer"
              onClick={(e) => handleRegionClick('face', e)}
            >
              <ellipse
                cx="150"
                cy="180"
                rx="100"
                ry="115"
                fill="url(#grad-face)"
                stroke={selectedRegion === 'face' ? '#3b82f6' : darken(faceColor, 40)}
                strokeWidth={selectedRegion === 'face' ? 2.5 : 1.2}
                strokeDasharray={selectedRegion === 'face' ? '6 3' : 'none'}
                filter="url(#dcm-shadow)"
              />
              {/* Highlight overlay for 3D effect */}
              <ellipse
                cx="150"
                cy="180"
                rx="98"
                ry="113"
                fill="url(#dcm-highlight)"
                pointerEvents="none"
              />
            </g>

            {/* === MUZZLE === */}
            <g
              className="cursor-pointer"
              onClick={(e) => handleRegionClick('muzzle', e)}
            >
              <ellipse
                cx="150"
                cy="230"
                rx="55"
                ry="48"
                fill="url(#grad-muzzle)"
                stroke={selectedRegion === 'muzzle' ? '#3b82f6' : darken(muzzleColor, 30)}
                strokeWidth={selectedRegion === 'muzzle' ? 2.5 : 1}
                strokeDasharray={selectedRegion === 'muzzle' ? '5 3' : 'none'}
                filter="url(#dcm-inset)"
              />
            </g>

            {/* === EYES (decorative, not clickable) === */}
            <g pointerEvents="none">
              {/* Left eye */}
              <ellipse cx="118" cy="165" rx="12" ry="13" fill="#1a1a1a" />
              <ellipse cx="114" cy="161" rx="4" ry="4.5" fill="white" opacity="0.8" />
              {/* Right eye */}
              <ellipse cx="182" cy="165" rx="12" ry="13" fill="#1a1a1a" />
              <ellipse cx="178" cy="161" rx="4" ry="4.5" fill="white" opacity="0.8" />
            </g>

            {/* === NOSE === */}
            <g
              className="cursor-pointer"
              onClick={(e) => handleRegionClick('nose', e)}
            >
              <path
                d="M 150 210 Q 138 208, 134 218 Q 132 225, 140 228 Q 145 230, 150 227 Q 155 230, 160 228 Q 168 225, 166 218 Q 162 208, 150 210 Z"
                fill="url(#grad-nose)"
                stroke={selectedRegion === 'nose' ? '#3b82f6' : darken(noseColor, 30)}
                strokeWidth={selectedRegion === 'nose' ? 2 : 0.8}
                strokeDasharray={selectedRegion === 'nose' ? '4 2' : 'none'}
              />
              {/* Nose highlight */}
              <ellipse cx="148" cy="215" rx="5" ry="3" fill="white" opacity="0.15" />
            </g>

            {/* === MOUTH (decorative) === */}
            <g pointerEvents="none">
              <path
                d="M 140 238 Q 145 244, 150 240 Q 155 244, 160 238"
                fill="none"
                stroke="#4a3728"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>

            {/* Whisker dots */}
            <g pointerEvents="none" opacity="0.4">
              <circle cx="115" cy="232" r="1.5" fill="#4a3728" />
              <circle cx="108" cy="226" r="1.5" fill="#4a3728" />
              <circle cx="110" cy="239" r="1.5" fill="#4a3728" />
              <circle cx="185" cy="232" r="1.5" fill="#4a3728" />
              <circle cx="192" cy="226" r="1.5" fill="#4a3728" />
              <circle cx="190" cy="239" r="1.5" fill="#4a3728" />
            </g>
          </svg>
        </div>

        {/* Color picker popover */}
        {selectedRegion && selectedRegionDef && (
          <div
            ref={pickerRef}
            className="absolute z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-3 min-w-[180px]"
            style={{
              left: Math.min(pickerPos.x, 160),
              top: Math.min(pickerPos.y + 10, 260),
            }}
          >
            <div className="text-xs font-semibold text-slate-700 mb-1">
              {selectedRegionDef.label}
            </div>
            <div className="text-[10px] text-slate-400 mb-2">
              {selectedRegionDef.productPart}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={getRegionColor(selectedRegionDef)}
                onChange={(e) => handleColorInput(selectedRegion, e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
              />
              <div className="flex-1">
                <div
                  className="text-xs font-mono text-slate-600"
                >
                  {getRegionColor(selectedRegionDef).toUpperCase()}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleReset(selectedRegion)}
              className="w-full text-[10px] text-slate-400 hover:text-slate-600 transition-colors py-1"
            >
              Reset to detected
            </button>
          </div>
        )}
      </div>

      {/* Legend grid */}
      <div className="mt-4 grid grid-cols-3 gap-2 max-w-sm mx-auto">
        {REGIONS.map((region) => {
          const color = getRegionColor(region);
          const isActive = selectedRegion === region.id;
          return (
            <button
              key={region.id}
              onClick={() => {
                setPickerPos({ x: 100, y: 150 });
                setSelectedRegion(isActive ? null : region.id);
              }}
              className={`flex items-center gap-1.5 p-1.5 rounded-lg text-left transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50 border border-blue-200 shadow-sm'
                  : 'bg-white/60 border border-slate-100 hover:border-slate-200 hover:bg-white/80'
              }`}
            >
              <div
                className="w-5 h-5 rounded-md border border-slate-200/80 flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="min-w-0">
                <div className="text-[10px] font-medium text-slate-700 truncate leading-tight">
                  {region.label}
                </div>
                <div className="text-[8px] text-slate-400 truncate leading-tight">
                  {region.productPart}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
