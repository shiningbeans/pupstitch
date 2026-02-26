'use client';

import { LeashBuddyProductSpec } from '@/types/product-types';

interface ProductPreviewHeroProps {
  spec: LeashBuddyProductSpec;
  previewUrl: string | null;
  isGenerating: boolean;
}

export default function ProductPreviewHero({ spec, previewUrl, isGenerating }: ProductPreviewHeroProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-amber-100 overflow-hidden">
      {/* Preview Image */}
      <div className="relative aspect-square bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4">
            <div className="text-5xl animate-bounce">🐕</div>
            <p className="text-amber-700 text-sm font-medium">Generating 3D preview...</p>
            <div className="w-32 h-1.5 bg-amber-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 animate-pulse rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt={`${spec.productName} preview`}
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-amber-400">
            <div className="text-6xl">📦</div>
            <p className="text-sm">Preview will appear here</p>
          </div>
        )}
      </div>

      {/* Product Info Bar */}
      <div className="p-4 border-t border-amber-100">
        <h2 className="text-lg font-bold text-amber-900">{spec.productName}</h2>
        <div className="flex items-center gap-3 mt-2 text-sm text-amber-700">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-full text-xs font-medium">
            📏 {spec.dimensions.heightCm}×{spec.dimensions.widthCm}×{spec.dimensions.depthCm}cm
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-full text-xs font-medium capitalize">
            👂 {spec.earStyle}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-full text-xs font-medium uppercase">
            {spec.productSize}
          </span>
        </div>
      </div>
    </div>
  );
}
