'use client';

import { CustomPattern } from '@/types';
import { useState } from 'react';

interface ColorPanelProps {
  pattern: CustomPattern;
  onColorChange: (colorKey: string, newColor: string) => void;
}

// Standard yarn brand color suggestions
const YARN_COLORS: Record<string, Array<{ name: string; hex: string }>> = {
  primary: [
    { name: 'Honey Gold', hex: '#D4A574' },
    { name: 'Burnt Sienna', hex: '#B7410E' },
    { name: 'Charcoal', hex: '#36454F' },
    { name: 'Espresso', hex: '#2D2319' },
    { name: 'Caramel', hex: '#8B6914' },
    { name: 'Mahogany', hex: '#800000' },
    { name: 'Slate Gray', hex: '#708090' },
    { name: 'Chocolate', hex: '#3E2723' },
  ],
  secondary: [
    { name: 'Cream', hex: '#FEF3C7' },
    { name: 'Ivory', hex: '#FFFFF0' },
    { name: 'Pale Gold', hex: '#FFEAA7' },
    { name: 'Light Tan', hex: '#D4B896' },
    { name: 'Eggshell', hex: '#F0EAD6' },
    { name: 'Linen', hex: '#FAF0E6' },
  ],
  accent: [
    { name: 'Rose Pink', hex: '#DB6B7C' },
    { name: 'Coral', hex: '#FF7F50' },
    { name: 'Peachy', hex: '#FFCC99' },
    { name: 'Blush', hex: '#FFB6C1' },
  ],
  nose: [
    { name: 'Midnight Black', hex: '#000000' },
    { name: 'Dark Brown', hex: '#3E2723' },
    { name: 'Charcoal', hex: '#36454F' },
  ],
};

export default function ColorPanel({ pattern, onColorChange }: ColorPanelProps) {
  const [expandedColor, setExpandedColor] = useState<string | null>(null);

  // Get current color assignments
  const colorMap: Record<string, string> = {};
  for (const assignment of pattern.customizations.colorAssignments) {
    colorMap[assignment.colorKey] = assignment.hexCode;
  }

  const primaryColor = colorMap['primary'] || '#D97706';
  const secondaryColor = colorMap['secondary'] || '#FEF3C7';
  const accentColor = colorMap['accent'] || '#F43F5E';
  const noseColor = colorMap['nose'] || '#1C1917';

  const handleColorChange = (colorKey: string, hex: string) => {
    onColorChange(colorKey, hex);
  };

  return (
    <div className="space-y-6">
      {/* Primary Color */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-warm-primary">
          Body Color (Primary)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => handleColorChange('primary', e.target.value)}
            className="w-16 h-16 rounded-lg cursor-pointer border-2 border-amber-200 hover:border-amber-400 transition-colors"
          />
          <div className="flex-1">
            <p className="font-mono text-sm text-warm-secondary">{primaryColor}</p>
            <p className="text-xs text-gray-500">Used for main body, head, and primary markings</p>
          </div>
        </div>
        <button
          onClick={() => setExpandedColor(expandedColor === 'primary' ? null : 'primary')}
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          {expandedColor === 'primary' ? '- Suggested Colors' : '+ Suggested Colors'}
        </button>
        {expandedColor === 'primary' && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {YARN_COLORS.primary.map((color) => (
              <button
                key={color.hex}
                onClick={() => {
                  handleColorChange('primary', color.hex);
                  setExpandedColor(null);
                }}
                className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-amber-300"
              >
                <div
                  className="w-full h-8 rounded-md mb-2"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="text-xs font-medium text-warm-primary">{color.name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Secondary Color */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-warm-primary">
          Accent Color (Secondary)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={secondaryColor}
            onChange={(e) => handleColorChange('secondary', e.target.value)}
            className="w-16 h-16 rounded-lg cursor-pointer border-2 border-amber-200 hover:border-amber-400 transition-colors"
          />
          <div className="flex-1">
            <p className="font-mono text-sm text-warm-secondary">{secondaryColor}</p>
            <p className="text-xs text-gray-500">Used for belly, paws, and highlights</p>
          </div>
        </div>
        <button
          onClick={() => setExpandedColor(expandedColor === 'secondary' ? null : 'secondary')}
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          {expandedColor === 'secondary' ? '- Suggested Colors' : '+ Suggested Colors'}
        </button>
        {expandedColor === 'secondary' && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {YARN_COLORS.secondary.map((color) => (
              <button
                key={color.hex}
                onClick={() => {
                  handleColorChange('secondary', color.hex);
                  setExpandedColor(null);
                }}
                className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-amber-300"
              >
                <div
                  className="w-full h-8 rounded-md mb-2"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="text-xs font-medium text-warm-primary">{color.name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Accent Color */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-warm-primary">
          Detail Color (Accent)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => handleColorChange('accent', e.target.value)}
            className="w-16 h-16 rounded-lg cursor-pointer border-2 border-amber-200 hover:border-amber-400 transition-colors"
          />
          <div className="flex-1">
            <p className="font-mono text-sm text-warm-secondary">{accentColor}</p>
            <p className="text-xs text-gray-500">Used for ear tips, patches, and markings</p>
          </div>
        </div>
        <button
          onClick={() => setExpandedColor(expandedColor === 'accent' ? null : 'accent')}
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          {expandedColor === 'accent' ? '- Suggested Colors' : '+ Suggested Colors'}
        </button>
        {expandedColor === 'accent' && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {YARN_COLORS.accent.map((color) => (
              <button
                key={color.hex}
                onClick={() => {
                  handleColorChange('accent', color.hex);
                  setExpandedColor(null);
                }}
                className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-amber-300"
              >
                <div
                  className="w-full h-8 rounded-md mb-2"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="text-xs font-medium text-warm-primary">{color.name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nose Color */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-warm-primary">
          Nose & Eyes
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={noseColor}
            onChange={(e) => handleColorChange('nose', e.target.value)}
            className="w-16 h-16 rounded-lg cursor-pointer border-2 border-amber-200 hover:border-amber-400 transition-colors"
          />
          <div className="flex-1">
            <p className="font-mono text-sm text-warm-secondary">{noseColor}</p>
            <p className="text-xs text-gray-500">Used for nose, eyes, and safety features</p>
          </div>
        </div>
        <button
          onClick={() => setExpandedColor(expandedColor === 'nose' ? null : 'nose')}
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          {expandedColor === 'nose' ? '- Suggested Colors' : '+ Suggested Colors'}
        </button>
        {expandedColor === 'nose' && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {YARN_COLORS.nose.map((color) => (
              <button
                key={color.hex}
                onClick={() => {
                  handleColorChange('nose', color.hex);
                  setExpandedColor(null);
                }}
                className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-amber-300"
              >
                <div
                  className="w-full h-8 rounded-md mb-2"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="text-xs font-medium text-warm-primary">{color.name}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
