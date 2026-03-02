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

// ─── Wizard Steps ──────────────────────────────────────────────────
// Step 1: Name, breed, photo upload (auto-analyzes in background)
// Step 2: Material, ear style, ear size, product type (shown while photo analyzes)
// Step 3: Review detected colors (appears after analysis completes)
// Step 4: Generate

type WizardStep = 1 | 2 | 3;

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
  const [step, setStep] = useState<WizardStep>(1);
  const topRef = useRef<HTMLDivElement>(null);

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

  // Auto-analyze when photo is uploaded
  useEffect(() => {
    if (selectedFiles.length > 0 && !isAnalyzing && !analysisResult && !hasAutoAnalyzed) {
      setHasAutoAnalyzed(true);
      analyzeImage(selectedFiles[0]);
    }
  }, [selectedFiles, isAnalyzing, analysisResult, hasAutoAnalyzed, analyzeImage]);

  // When analysis completes and user is on step 2, auto-advance to step 3
  useEffect(() => {
    if (analysisResult && step === 2 && !colorsConfirmed) {
      setStep(3);
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [analysisResult, step, colorsConfirmed]);

  const handleImagesSelected = (files: File[], dataUrls: string[]) => {
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
    setUploadedImages(dataUrls);
    setColorsConfirmed(false);
    setHasAutoAnalyzed(false);
  };

  const needsSize = selectedProductType === 'pupstitch' || selectedProductType === 'both';
  const showLeashBuddyOptions = selectedProductType === 'leash-buddy' || selectedProductType === 'both';
  const colorsReady = colorsConfirmed || uploadedImages.length === 0 || !analysisResult;

  const canProceedStep1 = selectedBreeds.length > 0;
  const canProceedStep2 = !needsSize || selectedSize !== null;
  const canGenerate = canProceedStep1 && canProceedStep2 && colorsReady;

  const goToStep = (s: WizardStep) => {
    setStep(s);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setError(null);
    if (selectedFiles.length > 0 && !analysisResult) {
      await analyzeImage(selectedFiles[0]);
    }
    await generateFromAnalysis();
  };

  // Show generating state
  if (isGenerating && !error) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-lg mx-auto">
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
                  Building specs and generating preview...
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
    <div className="min-h-screen py-8 px-4" ref={topRef}>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-stone-900 mb-2 tracking-tight">
            Design Your {BRAND.catalog.leashBuddy.name}
          </h1>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => s < step ? goToStep(s as WizardStep) : undefined}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    s === step
                      ? 'bg-brand-coral text-white scale-110'
                      : s < step
                        ? 'bg-brand-coral/20 text-brand-coral cursor-pointer hover:bg-brand-coral/30'
                        : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {s < step ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : s}
                </button>
                {s < 3 && (
                  <div className={`w-8 h-0.5 ${s < step ? 'bg-brand-coral/30' : 'bg-stone-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-xs text-stone-400 mt-2">
            {step === 1 ? 'Your dog' : step === 2 ? 'Product options' : 'Confirm colors'}
          </div>
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
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-lg font-bold leading-none">&times;</button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* STEP 1: Name, breed, photo upload                              */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="glass p-6 sm:p-8 space-y-6">
            {/* Dog name */}
            <section>
              <label className="text-sm font-semibold text-stone-700 mb-2 block">
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
            </section>

            {/* Breed selector */}
            <section>
              <h2 className="text-sm font-semibold text-stone-700 mb-2">Breed</h2>
              <p className="text-xs text-stone-400 mb-3">Select up to 4 breeds for mixed breeds</p>
              <BreedSelector selectedBreeds={selectedBreeds} onToggle={toggleBreed} />
            </section>

            {/* Photo upload */}
            <section>
              <h2 className="text-sm font-semibold text-stone-700 mb-2">Upload a Photo</h2>
              <p className="text-xs text-stone-400 mb-3">We'll detect colors and markings automatically</p>
              <ImageUploader onImagesSelected={handleImagesSelected} selectedImages={uploadedImages} />
              {isAnalyzing && uploadedImages.length > 0 && (
                <div className="mt-4">
                  <AnalysisProgress uploadedImage={uploadedImages[0]} />
                </div>
              )}
            </section>

            {/* Next button */}
            <button
              onClick={() => canProceedStep1 && goToStep(2)}
              disabled={!canProceedStep1}
              className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
                canProceedStep1
                  ? 'bg-brand-coral text-white hover:bg-brand-coral-dark'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {!canProceedStep1 ? 'Select a breed to continue' : 'Next — Product Options'}
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* STEP 2: Product type, material, ear style, ear size            */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="glass p-6 sm:p-8 space-y-6">
            {/* Back button */}
            <button
              onClick={() => goToStep(1)}
              className="flex items-center gap-1 text-sm text-stone-500 hover:text-brand-coral transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {/* Product type */}
            <section>
              <h2 className="text-sm font-semibold text-stone-700 mb-3">Product Type</h2>
              <div className="grid grid-cols-3 gap-3">
                {PRODUCT_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setProductType(opt.id)}
                    className={`relative p-3 rounded-xl transition-all border text-center ${
                      selectedProductType === opt.id
                        ? 'border-brand-coral bg-brand-coral-soft shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <p className="font-bold text-stone-900 text-sm">{opt.label}</p>
                    <p className="text-xs text-stone-500 mt-1">{opt.description}</p>
                    {selectedProductType === opt.id && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-brand-coral text-white rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* LeashBuddy options */}
            {showLeashBuddyOptions && (
              <section className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-stone-700 mb-2">Material</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MATERIAL_OPTIONS.map((mat) => (
                      <button
                        key={mat.id}
                        onClick={() => updateLeashBuddyCustomizations({ material: mat.id as ProductMaterial })}
                        className={`p-3 rounded-xl transition-all border text-left ${
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
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-stone-700 mb-2">Ear Style</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {EAR_STYLE_OPTIONS.map((ear) => (
                      <button
                        key={ear.id}
                        onClick={() => updateLeashBuddyCustomizations({ earStyle: ear.id })}
                        className={`p-3 rounded-xl transition-all border text-center ${
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
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-stone-700 mb-2">Ear Size</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {EAR_SIZE_OPTIONS.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => updateLeashBuddyCustomizations({ earSize: size.id as EarSize })}
                        className={`p-3 rounded-xl transition-all border text-center ${
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
                </div>
              </section>
            )}

            {/* Size — only for PupStitch / Both */}
            {needsSize && (
              <section>
                <h3 className="text-sm font-semibold text-stone-700 mb-2">Amigurumi Size</h3>
                <div className="grid grid-cols-3 gap-3">
                  {SIZE_OPTIONS.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={`relative p-4 rounded-xl transition-all border text-center ${
                        selectedSize === size.id
                          ? 'border-brand-coral bg-brand-coral-soft shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <p className="font-bold text-stone-900 text-sm">{size.label}</p>
                      <p className="text-xs text-stone-500">{size.height}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Analyzing indicator if photo is still processing */}
            {isAnalyzing && (
              <div className="flex items-center gap-3 p-4 bg-brand-coral-soft/50 rounded-xl">
                <svg className="w-5 h-5 text-brand-coral animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-stone-700">Analyzing your photo...</p>
                  <p className="text-xs text-stone-500">Colors will be ready to review next</p>
                </div>
              </div>
            )}

            {/* Next button */}
            <button
              onClick={() => {
                if (!canProceedStep2) return;
                // If analysis is done, go to step 3. If not, also go but it'll show analyzing state
                if (analysisResult) {
                  goToStep(3);
                } else if (uploadedImages.length > 0) {
                  // Photo uploaded but still analyzing — go to step 3 which will show analyzing
                  goToStep(3);
                } else {
                  // No photo — skip color review, go straight to generate
                  handleGenerate();
                }
              }}
              disabled={!canProceedStep2}
              className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
                canProceedStep2
                  ? 'bg-brand-coral text-white hover:bg-brand-coral-dark'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {!canProceedStep2
                ? 'Pick a size to continue'
                : analysisResult
                  ? 'Next — Review Colors'
                  : uploadedImages.length > 0
                    ? 'Next — Review Colors'
                    : `Generate My ${BRAND.catalog.leashBuddy.name}`
              }
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* STEP 3: Review detected colors + generate                      */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="glass p-6 sm:p-8 space-y-6">
            {/* Back button */}
            <button
              onClick={() => goToStep(2)}
              className="flex items-center gap-1 text-sm text-stone-500 hover:text-brand-coral transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {/* Still analyzing? */}
            {isAnalyzing && (
              <div className="flex flex-col items-center gap-4 py-8">
                <svg className="w-10 h-10 text-brand-coral animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-sm text-stone-600">Still analyzing your photo — hang tight...</p>
              </div>
            )}

            {/* Color review */}
            {analysisResult && !isAnalyzing && (
              <>
                <div>
                  <h2 className="text-base font-bold text-stone-900 mb-1">Review Detected Colors</h2>
                  <p className="text-sm text-stone-500">
                    We detected these colors from your photo. Adjust anything that doesn't look right.
                  </p>
                </div>

                {/* Detected color summary */}
                <div className="bg-brand-coral-soft/50 rounded-xl p-4">
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
                  </div>
                </div>

                <DogColorModel
                  analysisResult={analysisResult}
                  customizations={leashBuddyCustomizations}
                  onColorChange={updateLeashBuddyCustomizations}
                />

                {/* Generate button */}
                {!colorsConfirmed ? (
                  <button
                    onClick={() => {
                      setColorsConfirmed(true);
                      handleGenerate();
                    }}
                    className="w-full py-3.5 rounded-xl bg-brand-coral text-white font-semibold hover:bg-brand-coral-dark transition-colors"
                  >
                    Colors Look Good — Generate My {BRAND.catalog.leashBuddy.name}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Generating...
                  </div>
                )}
              </>
            )}

            {/* No photo — just generate directly */}
            {!analysisResult && !isAnalyzing && (
              <div className="text-center py-6 space-y-4">
                <p className="text-sm text-stone-500">No photo uploaded — we'll use default breed colors.</p>
                <button
                  onClick={handleGenerate}
                  className="w-full py-3.5 rounded-xl bg-brand-coral text-white font-semibold hover:bg-brand-coral-dark transition-colors"
                >
                  Generate My {BRAND.catalog.leashBuddy.name}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
