'use client';

import { LeashBuddyProductSpec } from '@/types/product-types';
import ProductPreviewHero from './ProductPreviewHero';
import FabricSwatches from './FabricSwatches';
import EmbroiderySpecDisplay from './EmbroiderySpecDisplay';
import BOMTable from './BOMTable';

interface LeashBuddySpecPanelProps {
  spec: LeashBuddyProductSpec;
  previewUrl: string | null;
  isGeneratingPreview: boolean;
}

export default function LeashBuddySpecPanel({
  spec,
  previewUrl,
  isGeneratingPreview,
}: LeashBuddySpecPanelProps) {
  return (
    <div className="space-y-6">
      {/* Product Preview */}
      <ProductPreviewHero
        spec={spec}
        previewUrl={previewUrl}
        isGenerating={isGeneratingPreview}
      />

      {/* Fabric Colors */}
      <div className="bg-white rounded-2xl border-2 border-amber-100 p-4 sm:p-6">
        <FabricSwatches fabrics={spec.fabricColors} />
      </div>

      {/* Embroidery */}
      <div className="bg-white rounded-2xl border-2 border-amber-100 p-4 sm:p-6">
        <EmbroiderySpecDisplay specs={spec.embroiderySpecs} />
      </div>

      {/* BOM */}
      <div className="bg-white rounded-2xl border-2 border-amber-100 p-4 sm:p-6">
        <BOMTable items={spec.manufacturingBOM} />
      </div>

      {/* Assembly Notes */}
      <div className="bg-white rounded-2xl border-2 border-amber-100 p-4 sm:p-6">
        <h3 className="text-base font-bold text-amber-900 mb-3">Assembly Instructions</h3>
        <div className="space-y-2">
          {spec.assemblyNotes.map((note, idx) => (
            <p key={idx} className="text-sm text-amber-800 leading-relaxed">{note}</p>
          ))}
        </div>
      </div>

      {/* Spec Metadata */}
      <div className="text-center text-xs text-amber-400 space-y-0.5">
        <p>Spec Version {spec.specVersion}</p>
        <p>Generated {new Date(spec.generatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
