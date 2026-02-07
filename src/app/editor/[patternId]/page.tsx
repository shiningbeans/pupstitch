'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePatternStore } from '@/store/pattern-store';
import PatternEditor from '@/components/editor/PatternEditor';
import { CustomPattern } from '@/types';
import { generatePatternPDF } from '@/lib/export/pdf-generator';

export default function EditorPage() {
  const params = useParams();
  const patternId = params.patternId as string;

  // Read from store reactively — pattern is DERIVED, not copied to local state
  const currentPattern = usePatternStore((s) => s.currentPattern);
  const isGeneratingPreview = usePatternStore((s) => s.isGeneratingPreview);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const initRef = useRef(false);

  // Derive pattern from the store — if currentPattern matches our ID, use it
  const pattern: CustomPattern | null =
    currentPattern && currentPattern.id === patternId ? currentPattern : null;

  // Single initialization effect — runs once to ensure the pattern is loaded from IndexedDB
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (!patternId) {
      setError('No pattern ID provided');
      setIsLoading(false);
      return;
    }

    console.log('[Editor] Initializing for patternId:', patternId);

    const init = async () => {
      const store = usePatternStore.getState();

      // Ensure IndexedDB is initialized (migration + load saved patterns)
      await store.initStorage();

      // Check 1: Is currentPattern already in the store (e.g., just generated)?
      const storeAfterInit = usePatternStore.getState();
      if (storeAfterInit.currentPattern && storeAfterInit.currentPattern.id === patternId) {
        console.log('[Editor] Found pattern in Zustand memory');
        setIsLoading(false);
        return;
      }

      // Check 2: Load from IndexedDB via store action (async)
      console.log('[Editor] Not in memory, loading from IndexedDB...');
      try {
        await storeAfterInit.loadPattern(patternId);
        const afterLoad = usePatternStore.getState();
        if (afterLoad.currentPattern && afterLoad.currentPattern.id === patternId) {
          console.log('[Editor] Loaded from IndexedDB');
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error('[Editor] loadPattern error:', e);
      }

      // Nothing worked
      console.warn('[Editor] Pattern not found for:', patternId);
      setError('Pattern not found. Please generate a new pattern.');
      setIsLoading(false);
    };

    init();
  }, [patternId]);

  // When pattern becomes available after init (e.g., store update propagates), clear loading AND error
  useEffect(() => {
    if (pattern) {
      if (isLoading || error) {
        console.log('[Editor] Pattern arrived via store update, clearing loading/error');
        setError(null);
        setIsLoading(false);
      }
    }
  }, [pattern, isLoading, error]);

  const handleDownloadPDF = async () => {
    if (!pattern) return;
    setIsDownloading(true);
    try {
      await generatePatternPDF(pattern);
    } catch (err) {
      console.error('PDF generation failed:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to generate PDF: ${msg}`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-honey">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 mb-4">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-warm-primary">Loading your pattern...</h2>
        </div>
      </div>
    );
  }

  if (!pattern && (error || !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-honey">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">&#x26A0;&#xFE0F;</div>
          <h2 className="text-2xl font-bold text-warm-primary mb-2">Pattern Not Found</h2>
          <p className="text-warm-secondary mb-6">
            {error || 'The pattern you are looking for could not be loaded.'}
          </p>
          <Link href="/upload" className="btn-primary inline-block">
            Create a New Pattern
          </Link>
        </div>
      </div>
    );
  }

  // Safely extract body part analysis
  const bodyParts = pattern?.analysisResult?.bodyPartAnalysis ?? [];

  return (
    <div className="min-h-screen bg-gradient-honey">
      {/* Top Bar - hidden during print */}
      <div className="print:hidden sticky top-0 z-40 bg-white border-b-2 border-amber-100 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-amber-50 transition-colors"
              title="Create New Pattern"
            >
              <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-warm-primary">{pattern.name}</h1>
              <p className="text-sm text-warm-secondary">{pattern.breedId}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Download PDF - primary action */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="hidden sm:inline">Generating...</span>
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

            {/* Print - secondary action */}
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-white text-amber-700 font-medium rounded-lg border-2 border-amber-200 hover:bg-amber-50 transition-all flex items-center gap-2"
              title="Print pattern"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Image + Body Part Analysis — ALWAYS shown */}
      <div className="max-w-7xl mx-auto px-4 pt-6 print:hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Amigurumi Preview Image */}
          <div className="bg-white rounded-xl border-2 border-amber-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-amber-900 mb-4">Amigurumi Preview</h3>
            {isGeneratingPreview ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="w-10 h-10 text-amber-500 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-amber-600 text-sm">Generating amigurumi preview...</p>
              </div>
            ) : pattern.previewImageUrl ? (
              <div className="flex justify-center">
                <img
                  src={pattern.previewImageUrl}
                  alt={`Amigurumi preview of ${pattern.name}`}
                  className="max-w-full max-h-80 rounded-lg shadow-md object-contain"
                />
              </div>
            ) : pattern.dogPhotoUrl ? (
              <div className="flex flex-col items-center justify-center py-8">
                <img
                  src={pattern.dogPhotoUrl}
                  alt={`Reference photo for ${pattern.name}`}
                  className="max-w-full max-h-64 rounded-lg shadow-md object-contain mb-3"
                />
                <p className="text-xs text-amber-500">Your reference photo</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-amber-400">
                <div className="text-6xl mb-3">🧶</div>
                <p className="text-sm text-amber-700 font-medium">{pattern.breedId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Amigurumi</p>
                <p className="text-xs text-amber-500 mt-1">Upload a reference photo on the create page to see a preview here</p>
              </div>
            )}
          </div>

          {/* Body Part Analysis */}
          <div className="bg-white rounded-xl border-2 border-amber-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-amber-900 mb-4">Body Part Analysis</h3>
            {bodyParts.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {bodyParts.map((bp, idx) => (
                  <div key={idx} className="border border-amber-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: bp.primaryColor || '#d4a574' }}
                        title={bp.primaryColor || 'default'}
                      />
                      <span className="font-semibold text-amber-900 capitalize text-sm">{bp.partName}</span>
                      {bp.shape && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{bp.shape}</span>
                      )}
                    </div>
                    {bp.crochetNotes && (
                      <p className="text-xs text-gray-600 mt-1">{bp.crochetNotes}</p>
                    )}
                    {bp.markings && bp.markings.length > 0 && (
                      <p className="text-xs text-amber-700 mt-1">
                        Markings: {bp.markings.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {['Head', 'Body', 'Ears', 'Tail', 'Snout'].map((part) => (
                  <div key={part} className="border border-amber-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 rounded-full border border-gray-300 bg-amber-200" />
                      <span className="font-semibold text-amber-900 text-sm">{part}</span>
                    </div>
                    <p className="text-xs text-gray-500">Standard pattern for this body part</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PatternEditor pattern={pattern} />
      </div>
    </div>
  );
}
