'use client';

import { EmbroiderySpec } from '@/types/product-types';

interface EmbroiderySpecDisplayProps {
  specs: EmbroiderySpec[];
}

const LOCATION_LABELS: Record<string, string> = {
  'front-flap': 'Face (Front Flap)',
  'paw-left': 'Left Paw',
  'paw-right': 'Right Paw',
  'back-logo': 'Back Logo',
  'ear-patch-left': 'Left Ear Patch',
  'ear-patch-right': 'Right Ear Patch',
};

export default function EmbroiderySpecDisplay({ specs }: EmbroiderySpecDisplayProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-amber-900">Embroidery Specifications</h3>

      <div className="space-y-3">
        {specs.map((spec) => (
          <div
            key={spec.location}
            className="p-3 bg-amber-50 rounded-xl border border-amber-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  {LOCATION_LABELS[spec.location] || spec.location}
                </p>
                <p className="text-xs text-amber-700 mt-0.5">{spec.designDescription}</p>
              </div>
              <span className="text-xs text-amber-500 flex-shrink-0 ml-2">
                {spec.dimensions.widthMm}×{spec.dimensions.heightMm}mm
              </span>
            </div>

            {/* Thread Colors */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {spec.threadColors.map((thread, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded-full border border-amber-200"
                >
                  <div
                    className="w-3 h-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: thread.hex }}
                  />
                  <span className="text-xs text-amber-800">{thread.name}</span>
                  <span className="text-xs text-amber-500">({thread.usage})</span>
                </div>
              ))}
            </div>

            {/* Stitch Count */}
            <p className="text-xs text-amber-500 mt-1.5">
              ~{spec.estimatedStitchCount.toLocaleString()} stitches
            </p>

            {spec.notes && (
              <p className="text-xs text-amber-600 italic mt-1">{spec.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
