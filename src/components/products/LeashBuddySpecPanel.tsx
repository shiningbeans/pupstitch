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
  previewOptions: string[];
  selectedPreviewIndex: number | null;
  onSelectPreview: (index: number) => void;
}

export default function LeashBuddySpecPanel({
  spec,
  previewUrl,
  isGeneratingPreview,
  previewOptions,
  selectedPreviewIndex,
  onSelectPreview,
}: LeashBuddySpecPanelProps) {
  return (
    <div className="space-y-6">
      <ProductPreviewHero
        spec={spec}
        previewUrl={previewUrl}
        isGenerating={isGeneratingPreview}
        previewOptions={previewOptions}
        selectedPreviewIndex={selectedPreviewIndex}
        onSelectPreview={onSelectPreview}
      />
      <div className="glass-solid p-4 sm:p-6 border border-stone-200/50"><FabricSwatches fabrics={spec.fabricColors} /></div>
      <div className="glass-solid p-4 sm:p-6 border border-stone-200/50"><EmbroiderySpecDisplay specs={spec.embroiderySpecs} /></div>
      <div className="glass-solid p-4 sm:p-6 border border-stone-200/50"><BOMTable items={spec.manufacturingBOM} /></div>
      <div className="glass-solid p-4 sm:p-6 border border-stone-200/50">
        <h3 className="text-base font-semibold text-stone-900 mb-3">Assembly Instructions</h3>
        <div className="space-y-2">
          {spec.assemblyNotes.map((note, idx) => (
            <p key={idx} className="text-sm text-stone-600 leading-relaxed">{note}</p>
          ))}
        </div>
      </div>
      <div className="text-center text-xs text-stone-400 space-y-0.5">
        <p>Spec Version {spec.specVersion}</p>
        <p>Generated {new Date(spec.generatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
