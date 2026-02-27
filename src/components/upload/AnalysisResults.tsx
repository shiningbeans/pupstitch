'use client';

import { DogAnalysisResult, DogBreed } from '@/types';
import { useState } from 'react';

interface AnalysisResultsProps {
  analysisResult: DogAnalysisResult;
  onConfirm: () => void;
  onChangeBreed: (breedId: DogBreed) => void;
  isGenerating?: boolean;
}

const BREED_NAMES: Record<DogBreed, string> = {
  labrador: 'Labrador Retriever',
  'german-shepherd': 'German Shepherd',
  'golden-retriever': 'Golden Retriever',
  'french-bulldog': 'French Bulldog',
  bulldog: 'Bulldog',
  poodle: 'Poodle',
  beagle: 'Beagle',
  rottweiler: 'Rottweiler',
  dachshund: 'Dachshund',
  corgi: 'Corgi',
};

export default function AnalysisResults({
  analysisResult,
  onConfirm,
  onChangeBreed,
  isGenerating = false,
}: AnalysisResultsProps) {
  const [selectedBreed, setSelectedBreed] = useState<DogBreed>(
    analysisResult.detectedBreed
  );

  const handleBreedChange = (newBreed: DogBreed) => {
    setSelectedBreed(newBreed);
    onChangeBreed(newBreed);
  };

  const confidencePercentage = Math.round(analysisResult.confidenceScore * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-solid p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Meet {BREED_NAMES[selectedBreed]}!
            </h2>
            <p className="text-base text-slate-600">
              We detected a <span className="font-bold">{BREED_NAMES[selectedBreed]}</span> with{' '}
              <span className="font-bold text-[var(--primary)]">{confidencePercentage}%</span>{' '}
              confidence
            </p>
          </div>
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--primary)]/10 flex-shrink-0">
            <svg className="w-7 h-7 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Breed Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Not quite right?</h3>
        <p className="text-sm text-slate-500">
          Adjust the breed if you&apos;d like to customize for a different breed type:
        </p>
        <select
          value={selectedBreed}
          onChange={(e) => handleBreedChange(e.target.value as DogBreed)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
        >
          {Object.entries(BREED_NAMES).map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Colors */}
      <div className="glass-solid p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Detected Colors</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analysisResult.colors.primary && (
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-xl shadow-sm border border-slate-200 flex-shrink-0"
                style={{ backgroundColor: analysisResult.colors.primary }}
              />
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Primary Color</p>
                <p className="text-lg font-bold text-slate-900">{analysisResult.colors.primary}</p>
              </div>
            </div>
          )}

          {analysisResult.colors.secondary && (
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-xl shadow-sm border border-slate-200 flex-shrink-0"
                style={{ backgroundColor: analysisResult.colors.secondary }}
              />
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Secondary Color</p>
                <p className="text-lg font-bold text-slate-900">{analysisResult.colors.secondary}</p>
              </div>
            </div>
          )}

          {analysisResult.colors.accent && (
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-xl shadow-sm border border-slate-200 flex-shrink-0"
                style={{ backgroundColor: analysisResult.colors.accent }}
              />
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Accent Color</p>
                <p className="text-lg font-bold text-slate-900">{analysisResult.colors.accent}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Distinctive Features */}
      <div className="glass-solid p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Distinctive Features</h3>

        <div className="space-y-3">
          {/* Ear Shape */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Ear Shape</p>
              <p className="text-sm text-slate-500 capitalize">{analysisResult.earShape}</p>
            </div>
          </div>

          {/* Tail Type */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Tail Type</p>
              <p className="text-sm text-slate-500 capitalize">{analysisResult.tailType}</p>
            </div>
          </div>

          {/* Build Type */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Build Type</p>
              <p className="text-sm text-slate-500 capitalize">{analysisResult.bodyProportions.buildType}</p>
            </div>
          </div>

          {/* Body Proportions */}
          {analysisResult.bodyProportions && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <p className="font-semibold text-slate-900 text-sm">Body Proportions</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Head to Body</span>
                  <div className="w-32 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full"
                      style={{
                        width: `${Math.min(
                          (analysisResult.bodyProportions.headToBodyRatio / 0.5) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Leg Length</span>
                  <div className="w-32 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full"
                      style={{
                        width: `${Math.min(
                          analysisResult.bodyProportions.legLength * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Tail Length</span>
                  <div className="w-32 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full"
                      style={{
                        width: `${Math.min(
                          analysisResult.bodyProportions.tailLength * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Markings */}
          {analysisResult.markings && analysisResult.markings.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="font-semibold text-slate-900 text-sm mb-3">Markings</p>
              <div className="space-y-2">
                {analysisResult.markings.map((marking, idx) => (
                  <p key={idx} className="text-sm text-slate-500 capitalize">
                    <span className="font-medium text-slate-700">{marking.type}</span> on{' '}
                    {marking.location}
                    {marking.coverage && (
                      <span> ({Math.round(marking.coverage * 100)}% coverage)</span>
                    )}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unique Features */}
      {analysisResult.distinctiveFeatures &&
        analysisResult.distinctiveFeatures.length > 0 && (
          <div className="glass-solid p-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900">What Makes Them Unique</h3>
            <div className="space-y-3">
              {analysisResult.distinctiveFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{feature.name}</p>
                    <p className="text-sm text-slate-500">{feature.description}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {Math.round(feature.confidence * 100)}% confidence
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* CTA */}
      <div className="glass-solid p-8 text-center">
        <button
          onClick={onConfirm}
          disabled={isGenerating}
          className={`btn-primary text-base py-4 px-8 w-full sm:w-auto ${
            isGenerating ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Pattern...
            </span>
          ) : (
            'Generate My Pattern'
          )}
        </button>
        <p className="text-sm text-slate-500 mt-3">
          Your custom pattern will be created in the next step
        </p>
      </div>
    </div>
  );
}
