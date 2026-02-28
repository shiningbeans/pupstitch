'use client';

import { FabricColorSpec } from '@/types/product-types';

interface FabricSwatchesProps { fabrics: FabricColorSpec[]; }

export default function FabricSwatches({ fabrics }: FabricSwatchesProps) {
  const grouped = fabrics.reduce<Record<string, FabricColorSpec[]>>((acc, f) => {
    const key = f.material;
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-stone-900">Fabric Colors & Materials</h3>
      {Object.entries(grouped).map(([material, items]) => (
        <div key={material} className="space-y-2">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{material}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {items.map((f) => (
              <div key={f.part} className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200">
                <div className="w-8 h-8 rounded border border-stone-300 flex-shrink-0" style={{ backgroundColor: f.hex }} title={f.hex} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-stone-900 truncate">{f.partLabel}</p>
                  <p className="text-xs text-stone-500">{f.colorName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
