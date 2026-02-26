'use client';

import { useState } from 'react';
import {
  LeashBuddyCustomizations,
  ProductEarStyle,
  MATERIAL_OPTIONS,
  EAR_SIZE_OPTIONS,
} from '@/types/product-types';

const EAR_STYLE_OPTIONS: Array<{ id: ProductEarStyle; label: string; emoji: string }> = [
  { id: 'floppy', label: 'Floppy', emoji: '🐕' },
  { id: 'pointy', label: 'Pointy', emoji: '🐺' },
  { id: 'button', label: 'Button', emoji: '🐶' },
  { id: 'rose', label: 'Rose', emoji: '🌹' },
];

interface ColorFieldProps {
  label: string;
  value: string | undefined;
  placeholder: string;
  onChange: (hex: string) => void;
  onClear: () => void;
}

function ColorField({ label, value, placeholder, onChange, onClear }: ColorFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-amber-800 w-28 flex-shrink-0">{label}</label>
      <div className="flex items-center gap-2 flex-1">
        <input
          type="color"
          value={value || placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-amber-200 cursor-pointer"
        />
        <span className="text-xs text-amber-600 font-mono">{value || placeholder}</span>
        {value && (
          <button
            onClick={onClear}
            className="text-xs text-amber-400 hover:text-amber-600 ml-1"
            title="Reset to auto-detected"
          >
            reset
          </button>
        )}
      </div>
    </div>
  );
}

interface LeashBuddyCustomizerProps {
  customizations: LeashBuddyCustomizations;
  defaultColors: {
    body: string;
    ear: string;
    earInner: string;
    binding: string;
    flap: string;
    lining: string;
  };
  onUpdate: (updates: Partial<LeashBuddyCustomizations>) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export default function LeashBuddyCustomizer({
  customizations,
  defaultColors,
  onUpdate,
  onRegenerate,
  isRegenerating,
}: LeashBuddyCustomizerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border-2 border-amber-100 overflow-hidden">
      {/* Header / Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎨</span>
          <h3 className="text-base font-bold text-amber-900">Customize Your LeashBuddy</h3>
        </div>
        <svg
          className={`w-5 h-5 text-amber-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-5 border-t border-amber-100 pt-4">
          {/* Material Selection */}
          <section>
            <h4 className="text-sm font-semibold text-amber-900 mb-2">Material</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MATERIAL_OPTIONS.map((mat) => (
                <button
                  key={mat.id}
                  onClick={() => onUpdate({ material: mat.id })}
                  className={`p-3 rounded-lg text-left transition-all border-2 ${
                    customizations.material === mat.id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-amber-100 hover:border-amber-200'
                  }`}
                >
                  <p className="font-semibold text-amber-900 text-sm">{mat.label}</p>
                  <p className="text-xs text-amber-600 mt-0.5">{mat.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Ear Style */}
          <section>
            <h4 className="text-sm font-semibold text-amber-900 mb-2">Ear Style</h4>
            <div className="grid grid-cols-4 gap-2">
              {EAR_STYLE_OPTIONS.map((ear) => (
                <button
                  key={ear.id}
                  onClick={() => onUpdate({ earStyle: ear.id })}
                  className={`p-2 rounded-lg text-center transition-all border-2 ${
                    customizations.earStyle === ear.id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-amber-100 hover:border-amber-200'
                  }`}
                >
                  <div className="text-xl">{ear.emoji}</div>
                  <p className="text-xs font-medium text-amber-900 mt-1">{ear.label}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Ear Size */}
          <section>
            <h4 className="text-sm font-semibold text-amber-900 mb-2">Ear Size</h4>
            <div className="grid grid-cols-3 gap-2">
              {EAR_SIZE_OPTIONS.map((size) => (
                <button
                  key={size.id}
                  onClick={() => onUpdate({ earSize: size.id })}
                  className={`p-2 rounded-lg text-center transition-all border-2 ${
                    customizations.earSize === size.id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-amber-100 hover:border-amber-200'
                  }`}
                >
                  <p className="text-sm font-medium text-amber-900">{size.label}</p>
                  <p className="text-xs text-amber-600 mt-0.5">{size.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Color Overrides */}
          <section>
            <h4 className="text-sm font-semibold text-amber-900 mb-3">Colors</h4>
            <div className="space-y-3">
              <ColorField
                label="Body"
                value={customizations.bodyColor}
                placeholder={defaultColors.body}
                onChange={(hex) => onUpdate({ bodyColor: hex })}
                onClear={() => onUpdate({ bodyColor: undefined })}
              />
              <ColorField
                label="Ear (outer)"
                value={customizations.earColor}
                placeholder={defaultColors.ear}
                onChange={(hex) => onUpdate({ earColor: hex })}
                onClear={() => onUpdate({ earColor: undefined })}
              />
              <ColorField
                label="Ear (inner)"
                value={customizations.earInnerColor}
                placeholder={defaultColors.earInner}
                onChange={(hex) => onUpdate({ earInnerColor: hex })}
                onClear={() => onUpdate({ earInnerColor: undefined })}
              />
              <ColorField
                label="Binding/Trim"
                value={customizations.bindingColor}
                placeholder={defaultColors.binding}
                onChange={(hex) => onUpdate({ bindingColor: hex })}
                onClear={() => onUpdate({ bindingColor: undefined })}
              />
              <ColorField
                label="Front Flap"
                value={customizations.flapColor}
                placeholder={defaultColors.flap}
                onChange={(hex) => onUpdate({ flapColor: hex })}
                onClear={() => onUpdate({ flapColor: undefined })}
              />
              <ColorField
                label="Interior"
                value={customizations.liningColor}
                placeholder={defaultColors.lining}
                onChange={(hex) => onUpdate({ liningColor: hex })}
                onClear={() => onUpdate({ liningColor: undefined })}
              />
            </div>
          </section>

          {/* Name Embroidery Toggle */}
          <section>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={customizations.includeNameEmbroidery}
                onChange={(e) => onUpdate({ includeNameEmbroidery: e.target.checked })}
                className="w-4 h-4 rounded border-amber-300 text-amber-500 focus:ring-amber-200"
              />
              <span className="text-sm text-amber-800">Embroider dog&apos;s name on back panel</span>
            </label>
          </section>

          {/* Regenerate Button */}
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
              isRegenerating
                ? 'bg-amber-200 text-amber-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isRegenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Regenerating Preview...
              </span>
            ) : (
              'Regenerate Preview with These Options'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
