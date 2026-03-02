/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePatternStore } from '@/store/pattern-store';
import BreedSelector from '@/components/upload/BreedSelector';
import ImageUploader from '@/components/upload/ImageUploader';
import AnalysisProgress from '@/components/upload/AnalysisProgress';
import DogColorModel from '@/components/upload/DogColorModel';
import { BRAND } from '@/lib/brand';
import {
  ProductType,
  MATERIAL_OPTIONS,
  EAR_SIZE_OPTIONS,
  ProductEarStyle,
  ProductMaterial,
  EarSize,
} from '@/types/product-types';

type DollSize = 'small' | 'medium' | 'large';

const PRODUCT_TYPE_OPTIONS: Array<{
  id: ProductType;
  label: string;
  description: string;
}> = [
  {
    id: 'leash-buddy',
    label: BRAND.product.pouch,
    description: 'Custom poop bag holder that looks like your dog',
  },
  {
    id: 'pupstitch',
    label: BRAND.product.stitch,
    description: 'Crochet amigurumi pattern for a stuffed dog',
  },
  {
    id: 'both',
    label: 'Both',
    description: 'Get a product spec + crochet pattern',
  },
];

const SIZE_OPTIONS: Array<{
  id: DollSize;
  label: string;
  height: string;
}> = [
  { id: 'small', label: 'Small', height: '4"' },
  { id: 'medium', label: 'Medium', height: '8"' },
  { id: 'large', label: 'Large', height: '12"' },
];

const EAR_STYLE_OPTIONS: Array<{
  id: ProductEarStyle;
  label: string;
  description: string;
}> = [
  { id: 'floppy', label: 'Floppy', description: 'Drape down from top corners' },
  { id: 'pointy', label: 'Pointy', description: 'Stand upright at top corners' },
  { id: 'button', label: 'Button', description: 'Fold neatly, droop slightly' },
  { id: 'rose', label: 'Rose', description: 'Curve outward at the sides' },
];

export default function UploadPage() {
  const router = useRouter();
  const {
    uploadedImages,
    isAnalyzing,
    isGenerating,
    currentPattern,
    analysisResult,
    selectedBreeds,
    selectedSize,
    dogName,
    selectedProductType,
    leashBuddyCustomizations,
    error,
    toggleBreed,
    setSelectedSize,
    setDogName,
    setProductType,
    setUploadedImages,
    analyzeImage,
    generateFromAnalysis,
    updateLeashBuddyCustomizations,
    setError,
  } = usePatternStore();

  const initStorage = usePatternStore((s) => s.initStorage);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [colorsConfirmed, setColorsConfirmed] = useState(false);
  const [hasAutoAnalyzed, setHasAutoAnalyzed] = useState(false);
  const colorSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => { await initStorage(); };
    init();
  }, [initStorage]);

  // Navigate to editor when pattern is ready
  useEffect(() => {
    if (currentPattern && !isGenerating) {
      router.push(`/editor/${currentPattern.id}`);
    }
  }, [currentPattern, isGenerating, router]);

  // Auto-analyze when photo is uploaded (not waiting for Generate click)
  useEffect(() => {
    if (selectedFiles.length > 0 && !isAnalyzing && !analysisResult && !hasAutoAnalyzed) {
      setHasAutoAnalyzed(true);
      analyzeImage(selectedFiles[0]);
    }
  }, [selectedFiles, isAnalyzing, analysisResult, hasAutoAnalyzed, analyzeImage]);

  // Scroll to color section when analysis completes
  useEffect(() => {
    if (analysisResult && !colorsConfirmed && colorSectionRef.current) {
      setTimeout(() => {
        colorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [analysisResult, colorsConfirmed]);

  const handleImagesSelected = (files: File[], dataUrls: string[]) => {
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
    setUploadedImages(dataUrls);
    // Reset analysis state for new photos
    setColorsConfirmed(false);
    setHasAutoAnalyzed(false);
  };

  const needsSize = selectedProductType === 'pupstitch' || selectedProductType === 'both';
  const canGenerate = selectedBreeds.length > 0 && (!needsSize || selectedSize !== null);
  const showLeashBuddyOptions = selectedProductType === 'leash-buddy' || selectedProductType === 'both';

  // Colors are either confirmed by user or there's no photo (so no auto-detection needed)
  const colorsReady = colorsConfirmed || uploadedImages.length === 0 || !analysisResult;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setError(null);

    // If photo was uploaded but not analyzed yet, analyze first then generate
    if (selectedFiles.length > 0 && !analysisResult) {
      await analyzeImage(selectedFiles[0]);
    }

    await generateFromAnalysis();
  };

  const handleRetry = () => {
    setError(null);
  };

  // Show generating state
  if (isGenerating && !error) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass p-6 sm:p-8">
            <div className="flex flex-col items-center gap-6 py-12">
              <svg className="w-12 h-12 text-brand-coral animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div className="space-y-2 text-center">
                <p className="text-lg font-semibold text-stone-900">
                  Creating Your {BRAND.catalog.leashBuddy.name}
                </p>
                <p className="text-stone-500 text-sm">
                  Building specs and generating preview for your {selectedBreeds.join(' / ')}...
                </p>
              </div>
              <div className="w-full max-w-xs">
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-coral animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-stone-900 mb-2 tracking-tight">
            Design Your {BRAND.catalog.leashBuddy.name}
          </h1>
          <p className="text-stone-500">
            Upload a photo of your dog and we'll match the colors automatically
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-red-800 text-sm">Something went wrong</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button onClick={handleRetry} className="text-red-400 hover:text-red-600 text-lg font-bold leading-none">&times;</button>
            </div>
          </div>
        )}

        <div className="glass p-6 sm:p-8 space-y-8">

          {/* ─── Step 1: Photo Upload (top priority) ─── */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-brand-coral text-white flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h2 className="text-base font-bold text-stone-900">Upload a Photo of Your Dog</h2>
                <p className="text-sm text-stone-500">We'll detect colors and markings automatically</p>
              </div>
            </div>
            <ImageUploader onImagesSelected={handleImagesSelected} selectedImages={uploadedImages} />

            {/* Analysis in progress */}
            {isAnalyzing && uploadedImages.length > 0 && (
              <div className="mt-4">
                <AnalysisProgress uploadedImage={uploadedImages[0]} />
              </div>
            )}
          </section>

          {/* ─── Color Detection Results + Editor ─── */}
          {analysisResult && !isAnalyzing && (
            <>
              <hr className="border-stone-100" />
              <section ref={colorSectionRef}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-7 h-7 rounded-full bg-brand-coral text-white flex items-center justify-center text-sm font-bold">2</div>
                  <h2 className="text-base font-bold text-stone-900">Review Detected Colors</h2>
                </div>
                <p className="text-sm text-stone-500 mb-4 ml-10">
                  We detected these colors from your photo. Adjust anything that doesn't look right.
                </p>

                {/* Detected color summary */}
                <div className="bg-brand-coral-soft/50 rounded-xl p-4 mb-4">
                  <div className="flex flex-wrap gap-3 items-center">
                    {analysisResult.colors.primary && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: analysisResult.colors.primary }} />
                        <span className="text-xs text-stone-600">Primary</span>
                      </div>
                    )}
                    {analysisResult.colors.secondary && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: analysisResult.colors.secondary }} />
                        <span className="text-xs text-stone-600">Secondary</span>
                      </div>
                    )}
                    {analysisResult.colors.tertiary && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: analysisResult.colors.tertiary }} />
                        <span className="text-xs text-stone-600">Tertiary</span>
                      </div>
                    )}
                    {analysisResult.colors.accent && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: analysisResult.colors.accent }} />
                        <span className="text-xs text-stone-600">Accent</span>
                      </div>
                    )}
                    {analysisResult.bodyPartAnalysis && analysisResult.bodyPartAnalysis.length > 0 && (
                      <span className="text-xs text-stone-400 ml-auto">
                        {analysisResult.bodyPartAnalysis.length} body parts detected
                      </span>
                    )}
                  </div>
                </div>

                <DogColorModel
                  analysisResult={analysisResult}
                  customizations={leashBuddyCustomizations}
                  onColorChange={updateLeashBuddyCustomizations}
                />

                {/* Confirm colors button */}
                {!colorsConfirmed ? (
                  <button
                    onClick={() => setColorsConfirmed(true)}
                    className="w-full mt-4 py-3 rounded-xl bg-brand-coral text-white font-semibold hover:bg-brand-coral-dark transition-colors"
                  >
                    Colors Look Good — Continue
                  </button>
                ) : (
                  <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Colors confirmed
                    <button
                      onClick={() => setColorsConfirmed(false)}
                      className="ml-auto text-xs text-stone-400 hover:text-stone-600 underline"
                    >
                      Edit colors
                    </button>
                  </div>
                )}
              </section>
            </>
          )}

          <hr className="border-stone-100" />

          {/* ─── Step 3: Breed + Name ─── */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-brand-coral text-white flex items-center justify-center text-sm font-bold">
                {analysisResult ? '3' : '2'}
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">Breed & Name</h2>
                <p className="text-sm text-stone-500">Select up to 4 breeds for mixed breeds</p>
              </div>
            </div>
            <BreedSelector selectedBreeds={selectedBreeds} onToggle={toggleBreed} />

            <div className="mt-4">
              <label className="text-sm font-medium text-stone-700 mb-2 block">
                Dog's Name <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={dogName}
                onChange={(e) => setDogName(e.target.value)}
                placeholder="e.g., Buddy, Luna, Max..."
                maxLength={30}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-300 focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 outline-none transition-all text-base"
              />
            </div>
          </section>

          <hr className="border-stone-100" />

          {/* ─── Product Type ─── */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-brand-coral text-white flex items-center justify-center text-sm font-bold">
                {analysisResult ? '4' : '3'}
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">Product Type</h2>
                <p className="text-sm text-stone-500">What would you like to create?</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {PRODUCT_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setProductType(opt.id)}
                  className={`relative p-4 rounded-xl transition-all duration-200 border text-center ${
                    selectedProductType === opt.id
                      ? 'border-brand-coral bg-brand-coral-soft shadow-sm'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <p className="font-bold text-stone-900 text-sm">{opt.label}</p>
                  <p className="text-xs text-stone-500 mt-1">{opt.description}</p>
                  {selectedProductType === opt.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-brand-coral text-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* ─── LeashBuddy Options (material, ear style, ear size) ─── */}
          {showLeashBuddyOptions && (
            <>
              <hr className="border-stone-100" />
              <section>
                <h3 className="text-sm font-semibold text-stone-700 mb-3">Material</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MATERIAL_OPTIONS.map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => updateLeashBuddyCustomizations({ material: mat.id as ProductMaterial })}
                      className={`p-3 rounded-xl transition-all duration-200 border text-left ${
                        leashBuddyCustomizations.material === mat.id
                          ? 'border-brand-coral bg-brand-coral-soft shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <p className="font-semibold text-stone-900 text-sm">{mat.label}</p>
                      <p className="text-xs text-stone-500 mt-0.5 leading-tight">{mat.description}</p>
                    </button>
                  ))}
                </div>

                <h3 className="text-sm font-semibold text-stone-700 mb-3 mt-6">Ear Style</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EAR_STYLE_OPTIONS.map((ear) => (
                    <button
                      key={ear.id}
                      onClick={() => updateLeashBuddyCustomizations({ earStyle: ear.id })}
                      className={`p-3 rounded-xl transition-all duration-200 border text-center ${
                        leashBuddyCustomizations.earStyle === ear.id
                          ? 'border-brand-coral bg-brand-coral-soft shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <p className="font-semibold text-stone-900 text-sm">{ear.label}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{ear.description}</p>
                    </button>
                  ))}
                </div>

                <h3 className="text-sm font-semibold text-stone-700 mb-3 mt-6">Ear Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {EAR_SIZE_OPTIONS.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => updateLeashBuddyCustomizations({ earSize: size.id as EarSize })}
                      className={`p-3 rounded-xl transition-all duration-200 border text-center ${
                        leashBuddyCustomizations.earSize === size.id
                          ? 'border-brand-coral bg-brand-coral-soft shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <p className="font-semibold text-stone-900 text-sm">{size.label}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{size.description}</p>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Size — only for PupStitch / Both */}
          {needsSize && (
            <>
              <hr className="border-stone-100" />
              <section>
                <h2 className="text-base font-bold text-stone-900 mb-1">Amigurumi Size</h2>
                <p className="text-sm text-stone-500 mb-4">Choose the size for your crochet pattern</p>
                <div className="grid grid-cols-3 gap-3">
                  {SIZE_OPTIONS.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={`relative p-4 rounded-xl transition-all duration-200 border text-center ${
                        selectedSize === size.id
                          ? 'border-brand-coral bg-brand-coral-soft shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <p className="font-bold text-stone-900 text-sm">{size.label}</p>
                      <p className="text-xs text-stone-500">{size.height}</p>
                      {selectedSize === size.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-brand-coral text-white rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        {/* Generate Button */}
        <div className="sticky bottom-4 z-10">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating || (uploadedImages.length > 0 && !!analysisResult && !colorsReady)}
            className={`w-full py-4 rounded-full text-base font-bold shadow-lg transition-all duration-200 ${
              canGenerate && colorsReady && !isGenerating
                ? 'bg-brand-coral text-white hover:bg-brand-coral-dark hover:shadow-xl hover:-translate-y-0.5'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            {!canGenerate
              ? selectedBreeds.length === 0
                ? 'Select a breed to continue'
                : needsSize
                  ? 'Pick a size to continue'
                  : 'Select a breed to continue'
              : !colorsReady
                ? 'Confirm your colors above first'
                : isGenerating
                  ? 'Generating...'
                  : `Generate My ${BRAND.catalog.leashBuddy.name}`}
          </button>
        </div>
      </div>
    </div>
  );
}
