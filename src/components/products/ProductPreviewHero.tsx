'use client';

import { LeashBuddyProductSpec } from '@/types/product-types';

interface ProductPreviewHeroProps {
  spec: LeashBuddyProductSpec;
  previewUrl: string | null;
  isGenerating: boolean;
}

export default function ProductPreviewHero({ spec, previewUrl, isGenerating }: ProductPreviewHeroProps) {
  return (
    <div className="glass-solid overflow-hidden border border-slate-200/50">
      <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4">
            <svg className="w-10 h-10 text-[var(--primary)] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-slate-600 text-sm font-medium">Generating preview</p>
            <div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] animate-pulse rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        ) : previewUrl ? (
          <img src={previewUrl} alt={`${spec.productName} preview`} className="w-full h-full object-contain p-6" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
            <p className="text-sm">Preview will appear here</p>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-200/50">
        <h2 className="text-lg font-semibold text-slate-900">{spec.productName}</h2>
        <div className="flex items-center gap-2 mt-3 text-xs text-slate-600 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-medium">
            {spec.dimensions.heightCm}×{spec.dimensions.widthCm}×{spec.dimensions.depthCm}cm
          </span>
          <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-medium capitalize">
            {spec.earStyle}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-medium uppercase">
            {spec.productSize}
          </span>
        </div>
      </div>
    </div>
  );
}
