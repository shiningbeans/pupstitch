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

export default function LeashBuddySpecPanel({ spec, previewUrl, isGeneratingPreview, customizations, onUpdateCustomizations, onRegenerate }: LeashBuddySpecPanelProps) {
  const mainBody = spec.fabricColors.find(f => f.part === 'main-body');
  const earOuter = spec.fabricColors.find(f => f.part === 'ear-outer-left');
  const earInner = spec.fabricColors.find(f => f.part === 'ear-inner-left');
  const binding = spec.fabricColors.find(f => f.part === 'binding-edge');
  const flap = spec.fabricColors.find(f => f.part === 'front-flap');
  const lining = spec.fabricColors.find(f => f.part === 'interior-lining');

  const defaultColors = {
    body: mainBody?.hex || '#6B7280',
    ear: earOuter?.hex || '#4B5563',
    earInner: earInner?.hex || '#E2E8F0',
    binding: binding?.hex || '#374151',
    flap: flap?.hex || mainBody?.hex || '#6B7280',
    lining: lining?.hex || '#E2E8F0',
  };

  return (
    <div className="space-y-6">
      <ProductPreviewHero spec={spec} previewUrl={previewUrl} isGenerating={isGeneratingPreview} />
      <LeashBuddyCustomizer customizations={customizations} defaultColors={defaultColors} onUpdate={onUpdateCustomizations} onRegenerate={onRegenerate} isRegenerating={isGeneratingPreview} />
      <div className="glass-solid p-4 sm:p-6 border border-slate-200/50"><FabricSwatches fabrics={spec.fabricColors} /></div>
      <div className="glass-solid p-4 sm:p-6 border border-slate-200/50"><EmbroiderySpecDisplay specs={spec.embroiderySpecs} /></div>
      <div className="glass-solid p-4 sm:p-6 border border-slate-200/50"><BOMTable items={spec.manufacturingBOM} /></div>
      <div className="glass-solid p-4 sm:p-6 border border-slate-200/50">
        <h3 className="text-base font-semibold text-slate-900 mb-3">Assembly Instructions</h3>
        <div className="space-y-2">
          {spec.assemblyNotes.map((note, idx) => (
            <p key={idx} className="text-sm text-slate-600 leading-relaxed">{note}</p>
          ))}
        </div>
      </div>
      <div className="text-center text-xs text-slate-400 space-y-0.5">
        <p>Spec Version {spec.specVersion}</p>
        <p>Generated {new Date(spec.generatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
