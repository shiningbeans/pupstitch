'use client';

import { CustomPattern, ColorAssignment } from '@/types';
import { useState } from 'react';

interface ColorPanelProps {
  pattern: CustomPattern;
  onColorChange: (colorKey: string, newColor: string) => void;
  onAddColor: (colorKey: string, hexCode: string, yarnName: string) => void;
  onBodyPartColorChange: (partName: string, hexCode: string) => void;
}

// Common yarn colors for quick selection
const QUICK_COLORS = [
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'White', hex: '#FAFAFA' },
  { name: 'Cream', hex: '#FEF3C7' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Golden', hex: '#DAA520' },
  { name: 'Honey', hex: '#D4A574' },
  { name: 'Tan', hex: '#D2B48C' },
  { name: 'Caramel', hex: '#C4A265' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Dark Brown', hex: '#3E2723' },
  { name: 'Chocolate', hex: '#5C3317' },
  { name: 'Espresso', hex: '#2D2319' },
  { name: 'Rust', hex: '#B7410E' },
  { name: 'Mahogany', hex: '#800000' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Rose Pink', hex: '#DB6B7C' },
];

const BODY_PART_LABELS: Record<string, string> = {
  head: 'Head',
  body: 'Body',
  ears: 'Ears',
  legs: 'Legs',
  tail: 'Tail',
  snout: 'Snout / Muzzle',
  nose: 'Nose',
};

export default function ColorPanel({
  pattern,
  onColorChange,
  onAddColor,
  onBodyPartColorChange,
}: ColorPanelProps) {
  const [showAddColor, setShowAddColor] = useState(false);
  const [newColorHex, setNewColorHex] = useState('#8B4513');
  const [newColorName, setNewColorName] = useState('');
  const [expandedPart, setExpandedPart] = useState<string | null>(null);

  const bodyParts = pattern.analysisResult?.bodyPartAnalysis ?? [];
  const colorAssignments = pattern.customizations.colorAssignments;

  // Build a lookup for existing colors
  const colorMap: Record<string, string> = {};
  for (const a of colorAssignments) {
    colorMap[a.colorKey] = a.hexCode;
  }

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const key = newColorName.toLowerCase().replace(/\s+/g, '-');
    onAddColor(key, newColorHex, newColorName.trim());
    setShowAddColor(false);
    setNewColorName('');
    setNewColorHex('#8B4513');
  };

  return (
    <div className="space-y-6">
      {/* Section: Yarn Palette */}
      <div>
        <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide mb-3">
          Yarn Palette
        </h3>
        <p className="text-xs text-amber-600 mb-3">
          These are the yarn colors detected from your photo. Tap any swatch to change it.
        </p>
        <div className="space-y-2">
          {colorAssignments.map((assignment: ColorAssignment) => (
            <div
              key={assignment.colorKey}
              className="flex items-center gap-3 p-2 rounded-lg bg-amber-50/50 border border-amber-100"
            >
              <input
                type="color"
                value={assignment.hexCode}
                onChange={(e) =>
                  onColorChange(assignment.colorKey, e.target.value)
                }
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-amber-200 hover:border-amber-400 transition-colors flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-900 truncate">
                  {assignment.yarnName || assignment.colorKey}
                </p>
                <p className="text-xs text-amber-600 font-mono">
                  {assignment.hexCode}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Color Button */}
        {!showAddColor ? (
          <button
            onClick={() => setShowAddColor(true)}
            className="mt-3 w-full py-2 px-3 text-sm font-medium text-amber-700 bg-white border-2 border-dashed border-amber-300 rounded-lg hover:bg-amber-50 hover:border-amber-400 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add a Color
          </button>
        ) : (
          <div className="mt-3 p-3 bg-white rounded-lg border-2 border-amber-200 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-amber-200"
              />
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="Color name (e.g. Light Tan)"
                className="flex-1 px-3 py-2 text-sm border border-amber-200 rounded-lg focus:outline-none focus:border-amber-400"
              />
            </div>
            {/* Quick pick from common colors */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    setNewColorHex(c.hex);
                    setNewColorName(c.name);
                  }}
                  className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddColor}
                disabled={!newColorName.trim()}
                className="flex-1 py-1.5 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddColor(false)}
                className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t-2 border-amber-100" />

      {/* Section: Body Part Colors */}
      <div>
        <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide mb-3">
          Body Part Colors
        </h3>
        <p className="text-xs text-amber-600 mb-3">
          Fine-tune the color of each body part. These were detected from your photo.
        </p>

        {bodyParts.length > 0 ? (
          <div className="space-y-2">
            {bodyParts.map((bp) => {
              const label = BODY_PART_LABELS[bp.partName] || bp.partName;
              const isExpanded = expandedPart === bp.partName;

              return (
                <div
                  key={bp.partName}
                  className="rounded-lg border border-amber-100 overflow-hidden"
                >
                  {/* Body part row */}
                  <div className="flex items-center gap-3 p-3 bg-white">
                    <input
                      type="color"
                      value={bp.primaryColor || '#d4a574'}
                      onChange={(e) =>
                        onBodyPartColorChange(bp.partName, e.target.value)
                      }
                      className="w-9 h-9 rounded-lg cursor-pointer border-2 border-amber-200 hover:border-amber-400 transition-colors flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-amber-900">
                        {label}
                      </p>
                      <p className="text-xs text-amber-600 font-mono">
                        {bp.primaryColor || '#d4a574'}
                      </p>
                    </div>
                    {/* Additional colors indicator */}
                    {bp.colors && bp.colors.length > 1 && (
                      <button
                        onClick={() =>
                          setExpandedPart(isExpanded ? null : bp.partName)
                        }
                        className="flex items-center gap-1 px-2 py-1 text-xs text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                      >
                        <div className="flex -space-x-1">
                          {bp.colors.slice(1, 4).map((c, i) => (
                            <div
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border border-white"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <span>+{bp.colors.length - 1}</span>
                      </button>
                    )}
                  </div>

                  {/* Expanded: show all colors + markings */}
                  {isExpanded && bp.colors && bp.colors.length > 1 && (
                    <div className="px-3 pb-3 bg-amber-50/30 border-t border-amber-100">
                      <p className="text-xs text-amber-600 mt-2 mb-1.5">
                        Additional colors detected:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {bp.colors.slice(1).map((c, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-md border border-amber-100"
                          >
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: c }}
                            />
                            <span className="text-xs font-mono text-amber-700">
                              {c}
                            </span>
                          </div>
                        ))}
                      </div>
                      {bp.markings && bp.markings.length > 0 && (
                        <p className="text-xs text-amber-700 mt-2">
                          Markings: {bp.markings.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-amber-500 italic">
            No body part analysis available. Upload a photo to get per-part color detection.
          </p>
        )}
      </div>
    </div>
  );
}
