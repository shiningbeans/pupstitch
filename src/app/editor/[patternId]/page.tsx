'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePatternStore } from '@/store/pattern-store';
import PatternEditor from '@/components/editor/PatternEditor';
import LeashBuddySpecPanel from '@/components/products/LeashBuddySpecPanel';
import { CustomPattern } from '@/types';
import { generatePatternPDF } from '@/lib/export/pdf-generator';
import { generateProductSpecPDF } from '@/lib/export/product-spec-pdf';
import { BRAND } from '@/lib/brand';

export default function EditorPage() {
  const params = useParams();
  const patternId = params.patternId as string;

  const currentPattern = usePatternStore((s) => s.currentPattern);
  const isGeneratingPreview = usePatternStore((s) => s.isGeneratingPreview);
  const leashBuddySpec = usePatternStore((s) => s.leashBuddySpec);
  const isGeneratingProductPreview = usePatternStore((s) => s.isGeneratingProductPreview);
  const productPreviewUrl = usePatternStore((s) => s.productPreviewUrl);
  const productPreviewOptions = usePatternStore((s) => s.productPreviewOptions);
  const selectedPreviewIndex = usePatternStore((s) => s.selectedPreviewIndex);
  const selectProductPreview = usePatternStore((s) => s.selectProductPreview);

  const [isDownloading, setIsDownloading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [activeTab, setActiveTab] = useState<'leash-buddy' | 'pupstitch'>('leash-buddy');
  const loadAttempted = useRef(false);

  const pattern: CustomPattern | null =
    currentPattern && currentPattern.id === patternId ? currentPattern : null;

  useEffect(() => {
    if (pattern || loadAttempted.current) return;
    loadAttempted.current = true;
    (async () => {
      try {
        const store = usePatternStore.getState();
        await store.initStorage();
        await store.loadPattern(patternId);
        const after = usePatternStore.getState();
        if (!after.currentPattern || after.currentPattern.id !== patternId) {
          setLoadFailed(true);
        }
      } catch {
        setLoadFailed(true);
      }
    })();
  }, [pattern, patternId]);

  useEffect(() => {
    if (pattern && loadFailed) setLoadFailed(false);
  }, [pattern, loadFailed]);

  const handleDownloadPDF = async () => {
    if (!pattern) return;
    setIsDownloading(true);
    try {
      const spec = leashBuddySpec || pattern.leashBuddySpec;
      if (activeTab === 'leash-buddy' && spec) {
        await generateProductSpecPDF(spec);
      } else {
        await generatePatternPDF(pattern);
      }
    } catch (err) {
      console.error('PDF generation failed:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to generate PDF: ${msg}`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (pattern) {
    const bodyParts = pattern.analysisResult?.bodyPartAnalysis ?? [];

    return (
      <div className="min-h-screen">
        <div className="print:hidden sticky top-0 z-40 glass-solid border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/upload" className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-100 transition-colors" title="Back">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">{pattern.name}</h1>
                <p className="text-xs text-slate-400">{pattern.breedId}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="btn-small flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="hidden sm:inline">Generating</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </>
                )}
              </button>
              <button
                onClick={() => window.print()}
                className="btn-secondary px-3 py-2 text-sm flex items-center gap-2"
                title="Print"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>
        </div>

        {(leashBuddySpec || pattern.leashBuddySpec) && (
          <div className="max-w-7xl mx-auto px-4 pt-6 print:hidden">
            <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('leash-buddy')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'leash-buddy' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {BRAND.product.pouch} Spec
              </button>
              <button
                onClick={() => setActiveTab('pupstitch')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'pupstitch' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Crochet Pattern
              </button>
            </div>
          </div>
        )}

        {activeTab === 'leash-buddy' && (leashBuddySpec || pattern.leashBuddySpec) ? (
          <div className="max-w-3xl mx-auto px-4 py-6 print:hidden">
            <LeashBuddySpecPanel
              spec={(leashBuddySpec || pattern.leashBuddySpec)!}
              previewUrl={productPreviewUrl || (leashBuddySpec || pattern.leashBuddySpec)?.previewImageUrl || null}
              isGeneratingPreview={isGeneratingProductPreview}
              previewOptions={productPreviewOptions}
              selectedPreviewIndex={selectedPreviewIndex}
              onSelectPreview={selectProductPreview}
            />
          </div>
        ) : (
          <>
            <div className="max-w-7xl mx-auto px-4 pt-6 print:hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-solid p-6">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Amigurumi Preview</h3>
                  {isGeneratingPreview ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <svg className="w-8 h-8 text-[var(--primary)] animate-spin mb-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="text-slate-500 text-sm">Generating preview</p>
                    </div>
                  ) : pattern.previewImageUrl ? (
                    <div className="flex justify-center">
                      <img src={pattern.previewImageUrl} alt={`Preview of ${pattern.name}`} className="max-w-full max-h-80 rounded-lg shadow-sm object-contain" />
                    </div>
                  ) : pattern.dogPhotoUrl ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <img src={pattern.dogPhotoUrl} alt={`Reference for ${pattern.name}`} className="max-w-full max-h-64 rounded-lg shadow-sm object-contain mb-3" />
                      <p className="text-xs text-slate-400">Reference photo</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                      <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                      </svg>
                      <p className="text-sm text-slate-500 font-medium">{pattern.breedId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Amigurumi</p>
                      <p className="text-xs text-slate-400 mt-1">Upload a reference photo to see a preview</p>
                    </div>
                  )}
                </div>

                <div className="glass-solid p-6">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Body Part Analysis</h3>
                  {bodyParts.length > 0 ? (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-2">
                      {bodyParts.map((bp, idx) => (
                        <div key={idx} className="border border-slate-100 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: bp.primaryColor || '#64748b' }} title={bp.primaryColor || 'default'} />
                            <span className="font-medium text-slate-900 capitalize text-sm">{bp.partName}</span>
                            {bp.shape && <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{bp.shape}</span>}
                          </div>
                          {bp.crochetNotes && <p className="text-xs text-slate-500 mt-1">{bp.crochetNotes}</p>}
                          {bp.markings && bp.markings.length > 0 && <p className="text-xs text-slate-400 mt-1">Markings: {bp.markings.join(', ')}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-2">
                      {['Head', 'Body', 'Ears', 'Tail', 'Snout'].map((part) => (
                        <div key={part} className="border border-slate-100 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded-full border border-slate-200 bg-slate-200" />
                            <span className="font-medium text-slate-900 text-sm">{part}</span>
                          </div>
                          <p className="text-xs text-slate-400">Standard pattern</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-8">
              <PatternEditor pattern={pattern} />
            </div>
          </>
        )}
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Pattern Not Found</h2>
          <p className="text-slate-500 mb-6">The pattern you are looking for could not be loaded.</p>
          <Link href="/upload" className="btn-primary inline-block">Create a New Pattern</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <svg className="w-10 h-10 text-[var(--primary)] animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <h2 className="text-xl font-bold text-slate-900">Loading your pattern</h2>
      </div>
    </div>
  );
}
