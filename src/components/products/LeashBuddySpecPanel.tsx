'use client';

import { LeashBuddyProductSpec, LeashBuddyCustomizations } from '@/types/product-types';
import ProductPreviewHero from './ProductPreviewHero';
import FabricSwatches from './FabricSwatches';
import EmbroiderySpecDisplay from './EmbroiderySpecDisplay';
import BOMTable from './BOMTable';
import LeashBuddyCustomizer from './LeashBuddyCustomizer';

interface LeashBuddySpecPanelProps {
  spec: LeashBuddyProductSpec;
  previewUrl: string | null;
  isGeneratingPreview: boolean;
  customizations: LeashBuddyCustomizations;
  onUpdateCustomizations: (updates: Partial<LeashBuddyCustomizations>) => void;
  onRegenerate: () => void;
}

export default function LeashBuddySpecPanel({
  spec,
  previewUrl,
  isGeneratingPreview,
  customizations,
  onUpdateCustomizations,
  onRegenerate,
}: LeashBuddySpecPanelProps) {
  // Extract default colors from spec for the customizer's placeholders
  const mainBody = spec.fabricColors.find(f => f.part === 'main-body');
  const earOuter = spec.fabricColors.find(f => f.part === 'ear-outer-left');
  const earInner = spec.fabricColors.find(f => f.part === 'ear-inner-left');
  const binding = spec.fabricColors.find(f => f.part === 'binding-edge');
  const flap = spec.fabricColors.find(f => f.part === 'front-flap');
  const lining = spec.fabricColors.find(f => f.part === 'interior-lining');

  const defaultColors = {
    body: mainBody?.hex || '#D4A574',
    ear: earOuter?.hex || '#C4956A',
    earInner: earInner?.hex || '#F5E6D3',
    binding: binding?.hex || '#8B7355',
    flap: flap?.hex || mainBody?.hex || '#D4A574',
    lining: lining?.hex || '#F5E6D3',
  };

  return (
    <div className="space-y-6">
      {/* Product Preview */}
      <ProductPreviewHero
        spec={spec}
        previewUrl={previewUrl}
        isGenerating={isGeneratingPreview}
      />

      {/* Customizer */}
      <LeashBuddyCustomizer
        customizations={customizations}
        defaultColors={defaultColors}
        onUpdate={onUpdateCustomizations}
        onRegenerate={onRegenerate}
        isRegenerating={isGeneratingPreview}
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
