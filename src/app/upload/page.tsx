/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePatternStore } from '@/store/pattern-store';
import BreedSelector from '@/components/upload/BreedSelector';
import ImageUploader from '@/components/upload/ImageUploader';
import AnalysisProgress from '@/components/upload/AnalysisProgress';

type DollSize = 'small' | 'medium' | 'large';

const SIZE_OPTIONS: Array<{
  id: DollSize;
  label: string;
  height: string;
  emoji: string;
}> = [
  { id: 'small', label: 'Small', height: '4"', emoji: '🔑' },
  { id: 'medium', label: 'Medium', height: '8"', emoji: '🧸' },
  { id: 'large', label: 'Large', height: '12"', emoji: '🎁' },
];

export default function UploadPage() {
  const router = useRouter();
  const {
    uploadedImage,
    isAnalyzing,
    isGenerating,
    currentPattern,
    selectedBreeds,
    selectedSize,
    error,
    toggleBreed,
    setSelectedSize,
    setUploadedImage,
    analyzeImage,
    generateFromAnalysis,
    setError,
  } = usePatternStore();

  const initStorage = usePatternStore((s) => s.initStorage);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Ensure IndexedDB is initialized (migration from localStorage if needed)
  useEffect(() => {
    const init = async () => {
      await initStorage();
    };
    init();
  }, [initStorage]);

  // Navigate to editor when pattern is generated
  useEffect(() => {
    if (currentPattern && !isGenerating) {
      router.push(`/editor/${currentPattern.id}`);
    }
  }, [currentPattern, isGenerating, router]);

  // Chain: after analysis completes, auto-generate
  useEffect(() => {
    if (!isAnalyzing && isProcessing && !error && !isGenerating) {
      generateFromAnalysis();
    }
  }, [isAnalyzing, isProcessing, error, isGenerating, generateFromAnalysis]);

  const handleImageSelected = (file: File, dataUrl: string) => {
    setSelectedFile(file);
    setUploadedImage(dataUrl);
  };

  const canGenerate = selectedBreeds.length > 0 && selectedSize !== null;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsProcessing(true);
    setError(null);

    if (selectedFile && uploadedImage) {
      await analyzeImage(selectedFile);
    } else {
      await generateFromAnalysis();
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsProcessing(false);
  };

  // Show processing overlay
  if (isProcessing && (isAnalyzing || isGenerating) && !error) {
    return (
      <div className="min-h-screen bg-background-warm py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-100 p-6 sm:p-8">
            {isAnalyzing && uploadedImage ? (
              <AnalysisProgress uploadedImage={uploadedImage} />
            ) : (
              <div className="flex flex-col items-center gap-6 py-12">
                <div className="text-6xl animate-spin">🧶</div>
                <div className="space-y-2 text-center">
                  <p className="text-lg font-semibold text-amber-900">
                    Generating Your Pattern
                  </p>
                  <p className="text-amber-700 text-sm">
                    Creating row-by-row instructions for your {selectedBreeds.join(' / ')} amigurumi...
                  </p>
                </div>
                <div className="w-full max-w-xs">
                  <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 animate-pulse" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-warm py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-amber-900 mb-2">
            Create Your Pattern
          </h1>
          <p className="text-amber-700">
            Select breeds, pick a size, and optionally upload a photo
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">⚠️</span>
              <div className="flex-1">
                <p className="font-bold text-red-800 text-sm">Something went wrong</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button onClick={handleRetry} className="text-red-400 hover:text-red-600 text-xl font-bold">×</button>
            </div>
            <div className="mt-3 flex gap-3">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-100 p-6 sm:p-8 space-y-8">

          {/* Section 1: Breed Selection */}
          <section>
            <h2 className="text-lg font-bold text-amber-900 mb-1">Breed</h2>
            <p className="text-sm text-amber-600 mb-4">
              Select up to 4 breeds for mixed breeds
            </p>
            <BreedSelector
              selectedBreeds={selectedBreeds}
              onToggle={toggleBreed}
            />
          </section>

          <hr className="border-amber-100" />

          {/* Section 2: Size */}
          <section>
            <h2 className="text-lg font-bold text-amber-900 mb-4">Size</h2>
            <div className="grid grid-cols-3 gap-3">
              {SIZE_OPTIONS.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id)}
                  className={`relative p-4 rounded-xl transition-all duration-200 border-2 text-center ${
                    selectedSize === size.id
                      ? 'border-amber-500 bg-amber-50 shadow-md'
                      : 'border-amber-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{size.emoji}</div>
                  <p className="font-bold text-amber-900 text-sm">{size.label}</p>
                  <p className="text-xs text-amber-600">{size.height}</p>
                  {selectedSize === size.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          <hr className="border-amber-100" />

          {/* Section 3: Photo (Optional) */}
          <section>
            <h2 className="text-lg font-bold text-amber-900 mb-1">Photo <span className="text-sm font-normal text-amber-500">(optional)</span></h2>
            <p className="text-sm text-amber-600 mb-4">
              Upload a photo for accurate color and marking detection
            </p>
            <ImageUploader
              onImageSelected={handleImageSelected}
              selectedImage={uploadedImage ?? undefined}
            />
          </section>
        </div>

        {/* Generate Button */}
        <div className="sticky bottom-4 z-10">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isProcessing}
            className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg transition-all duration-200 ${
              canGenerate && !isProcessing
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 hover:shadow-xl'
                : 'bg-amber-200 text-amber-400 cursor-not-allowed'
            }`}
          >
            {!canGenerate
              ? selectedBreeds.length === 0
                ? 'Select a breed to continue'
                : 'Pick a size to continue'
              : uploadedImage
                ? 'Analyze Photo & Generate Pattern'
                : 'Generate Pattern'}
          </button>
        </div>
      </div>
    </div>
  );
}
