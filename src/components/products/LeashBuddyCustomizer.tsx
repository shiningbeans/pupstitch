'use client';

import { useState } from 'react';
import {
  LeashBuddyCustomizations,
  ProductEarStyle,
  MATERIAL_OPTIONS,
  EAR_SIZE_OPTIONS,
} from '@/types/product-types';

const EAR_STYLE_OPTIONS: Array<{ id: ProductEarStyle; label: string }> = [
  { id: 'floppy', label: 'Floppy' },
  { id: 'pointy', label: 'Pointy' },
  { id: 'button', label: 'Button' },
  { id: 'rose', label: 'Rose' },
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
      <label className="text-sm text-stone-600 w-28 flex-shrink-0">{label}</label>
      <div className="flex items-center gap-2 flex-1">
        <input type="color" value={value || placeholder} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded border border-stone-300 cursor-pointer" />
        <span className="text-xs text-stone-500 font-mono">{value || placeholder}</span>
        {value && (
          <button onClick={onClear} className="text-xs text-stone-400 hover:text-stone-600 ml-1" title="Reset to default">reset</button>
        )}
      </div>
    </div>
  );
}

interface LeashBuddyCustomizerProps {
  customizations: LeashBuddyCustomizations;
  defaultColors: { body: string; ear: string; earInner: string; binding: string; flap: string; lining: string };
  onUpdate: (updates: Partial<LeashBuddyCustomizations>) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export default function LeashBuddyCustomizer({ customizations, defaultColors, onUpdate, onRegenerate, isRegenerating }: LeashBuddyCustomizerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-solid overflow-hidden border border-stone-200/50">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-stone-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
          </svg>
          <h3 className="text-sm font-semibold text-stone-900">Customize</h3>
        </div>
        <svg className={`w-5 h-5 text-stone-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-5 border-t border-stone-200/50 pt-4">
          <section>
            <h4 className="text-sm font-semibold text-stone-900 mb-2">Material</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MATERIAL_OPTIONS.map((mat) => (
                <button key={mat.id} onClick={() => onUpdate({ material: mat.id })} className={`p-3 rounded-lg text-left transition-all border ${customizations.material === mat.id ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-stone-200 hover:border-stone-300'}`}>
                  <p className="font-semibold text-stone-900 text-sm">{mat.label}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{mat.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-stone-900 mb-2">Ear Style</h4>
            <div className="grid grid-cols-4 gap-2">
              {EAR_STYLE_OPTIONS.map((ear) => (
                <button key={ear.id} onClick={() => onUpdate({ earStyle: ear.id })} className={`p-2 rounded-lg text-center transition-all border ${customizations.earStyle === ear.id ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-stone-200 hover:border-stone-300'}`}>
                  <p className="text-xs font-medium text-stone-900">{ear.label}</p>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-stone-900 mb-2">Ear Size</h4>
            <div className="grid grid-cols-3 gap-2">
              {EAR_SIZE_OPTIONS.map((size) => (
                <button key={size.id} onClick={() => onUpdate({ earSize: size.id })} className={`p-2 rounded-lg text-center transition-all border ${customizations.earSize === size.id ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-stone-200 hover:border-stone-300'}`}>
                  <p className="text-sm font-medium text-stone-900">{size.label}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{size.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-stone-900 mb-3">Colors</h4>
            <div className="space-y-3">
              <ColorField label="Body" value={customizations.bodyColor} placeholder={defaultColors.body} onChange={(hex) => onUpdate({ bodyColor: hex })} onClear={() => onUpdate({ bodyColor: undefined })} />
              <ColorField label="Ear (outer)" value={customizations.earColor} placeholder={defaultColors.ear} onChange={(hex) => onUpdate({ earColor: hex })} onClear={() => onUpdate({ earColor: undefined })} />
              <ColorField label="Ear (inner)" value={customizations.earInnerColor} placeholder={defaultColors.earInner} onChange={(hex) => onUpdate({ earInnerColor: hex })} onClear={() => onUpdate({ earInnerColor: undefined })} />
              <ColorField label="Binding/Trim" value={customizations.bindingColor} placeholder={defaultColors.binding} onChange={(hex) => onUpdate({ bindingColor: hex })} onClear={() => onUpdate({ bindingColor: undefined })} />
              <ColorField label="Front Flap" value={customizations.flapColor} placeholder={defaultColors.flap} onChange={(hex) => onUpdate({ flapColor: hex })} onClear={() => onUpdate({ flapColor: undefined })} />
              <ColorField label="Interior" value={customizations.liningColor} placeholder={defaultColors.lining} onChange={(hex) => onUpdate({ liningColor: hex })} onClear={() => onUpdate({ liningColor: undefined })} />
            </div>
          </section>

          <section>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={customizations.includeNameEmbroidery} onChange={(e) => onUpdate({ includeNameEmbroidery: e.target.checked })} className="w-4 h-4 rounded border-stone-300 text-[var(--primary)] focus:ring-[var(--primary)]/20" />
              <span className="text-sm text-stone-600">Embroider dog&apos;s name on back panel</span>
            </label>
          </section>

          <button onClick={onRegenerate} disabled={isRegenerating} className={`w-full py-3 rounded-lg text-sm font-semibold transition-all ${isRegenerating ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-sm hover:shadow-md'}`}>
            {isRegenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Regenerating
              </span>
            ) : (
              'Regenerate Preview'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
