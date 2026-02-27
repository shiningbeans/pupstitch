'use client';

import { EmbroiderySpec } from '@/types/product-types';

interface EmbroiderySpecDisplayProps { specs: EmbroiderySpec[]; }

const LOCATION_LABELS: Record<string, string> = {
  'front-flap': 'Face (Front Flap)', 'paw-left': 'Left Paw', 'paw-right': 'Right Paw',
  'back-logo': 'Back Logo', 'ear-patch-left': 'Left Ear Patch', 'ear-patch-right': 'Right Ear Patch',
};

export default function EmbroiderySpecDisplay({ specs }: EmbroiderySpecDisplayProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-slate-900">Embroidery Specifications</h3>
      <div className="space-y-3">
        {specs.map((spec) => (
          <div key={spec.location} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{LOCATION_LABELS[spec.location] || spec.location}</p>
                <p className="text-xs text-slate-500 mt-0.5">{spec.designDescription}</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{spec.dimensions.widthMm}×{spec.dimensions.heightMm}mm</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {spec.threadColors.map((thread, i) => (
                <div key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded border border-slate-200">
                  <div className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: thread.hex }} />
                  <span className="text-xs text-slate-700">{thread.name}</span>
                  <span className="text-xs text-slate-400">({thread.usage})</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">~{spec.estimatedStitchCount.toLocaleString()} stitches</p>
            {spec.notes && <p className="text-xs text-slate-500 italic mt-1">{spec.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
