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

const EAR_SHAPE_ICONS: Record<string, string> = {
  floppy: '👂',
  pointy: '🔺',
  droopy: '📍',
  button: '⭕',
  pendant: '📎',
  rose: '🌹',
  flat: '▪️',
};

const TAIL_TYPE_ICONS: Record<string, string> = {
  curled: '🌀',
  plumed: '🪶',
  straight: '➡️',
  feathered: '🪶',
  docked: '✂️',
  saber: '⚔️',
  whip: '🪢',
  flag: '🚩',
  otter: '🦦',
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
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200 p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold text-amber-900 mb-2">
              Meet {BREED_NAMES[selectedBreed]}!
            </h2>
            <p className="text-lg text-amber-700">
              We detected a <span className="font-bold">{BREED_NAMES[selectedBreed]}</span> with{' '}
              <span className="font-bold text-amber-600">{confidencePercentage}%</span>{' '}
              confidence
            </p>
          </div>
          <div className="text-6xl">🎉</div>
        </div>
      </div>

      {/* Breed Selection */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-amber-900">Not quite right?</h3>
        <p className="text-amber-700">
          Adjust the breed if you&apos;d like to customize for a different breed type:
        </p>
        <select
          value={selectedBreed}
          onChange={(e) => handleBreedChange(e.target.value as DogBreed)}
          className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg bg-white text-amber-900 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        >
          {Object.entries(BREED_NAMES).map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Colors Section */}
      <div className="card p-8 space-y-6">
        <h3 className="text-2xl font-bold text-amber-900">Detected Colors</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Color */}
          {analysisResult.colors.primary && (
            <div className="flex items-center gap-4">
              <div
                className="w-24 h-24 rounded-xl shadow-md border-2 border-amber-200 flex-shrink-0"
                style={{ backgroundColor: analysisResult.colors.primary }}
              />
              <div>
                <p className="text-sm text-amber-700 font-medium mb-1">
                  Primary Color
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {analysisResult.colors.primary}
                </p>
              </div>
            </div>
          )}

          {/* Secondary Color */}
          {analysisResult.colors.secondary && (
            <div className="flex items-center gap-4">
              <div
                className="w-24 h-24 rounded-xl shadow-md border-2 border-amber-200 flex-shrink-0"
                style={{ backgroundColor: analysisResult.colors.secondary }}
              />
              <div>
                <p className="text-sm text-amber-700 font-medium mb-1">
                  Secondary Color
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {analysisResult.colors.secondary}
                </p>
              </div>
            </div>
          )}

          {/* Accent Color */}
          {analysisResult.colors.accent && (
            <div className="flex items-center gap-4">
              <div
                className="w-24 h-24 rounded-xl shadow-md border-2 border-amber-200 flex-shrink-0"
                style={{ backgroundColor: analysisResult.colors.accent }}
              />
              <div>
                <p className="text-sm text-amber-700 font-medium mb-1">
                  Accent Color
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {analysisResult.colors.accent}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Distinctive Features */}
      <div className="card p-8 space-y-6">
        <h3 className="text-2xl font-bold text-amber-900">
          Distinctive Features
        </h3>

        <div className="space-y-4">
          {/* Ear Shape */}
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-3">
              <span className="text-4xl">
                {EAR_SHAPE_ICONS[analysisResult.earShape] || '👂'}
              </span>
              <div>
                <p className="font-semibold text-amber-900">Ear Shape</p>
                <p className="text-sm text-amber-700 capitalize">
                  {analysisResult.earShape}
                </p>
              </div>
            </div>
          </div>

          {/* Tail Type */}
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-3">
              <span className="text-4xl">
                {TAIL_TYPE_ICONS[analysisResult.tailType] || '🐕'}
              </span>
              <div>
                <p className="font-semibold text-amber-900">Tail Type</p>
                <p className="text-sm text-amber-700 capitalize">
                  {analysisResult.tailType}
                </p>
              </div>
            </div>
          </div>

          {/* Build Type */}
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-3">
              <span className="text-4xl">💪</span>
              <div>
                <p className="font-semibold text-amber-900">Build Type</p>
                <p className="text-sm text-amber-700 capitalize">
                  {analysisResult.bodyProportions.buildType}
                </p>
              </div>
            </div>
          </div>

          {/* Body Proportions */}
          {analysisResult.bodyProportions && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
              <p className="font-semibold text-amber-900">Body Proportions</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-700">Head to Body</span>
                  <div className="w-32 bg-amber-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                      style={{
                        width: `${Math.min(
                          (analysisResult.bodyProportions.headToBodyRatio / 0.5) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-700">Leg Length</span>
                  <div className="w-32 bg-amber-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
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
                  <span className="text-sm text-amber-700">Tail Length</span>
                  <div className="w-32 bg-amber-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
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
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="font-semibold text-amber-900 mb-3">Markings</p>
              <div className="space-y-2">
                {analysisResult.markings.map((marking, idx) => (
                  <p key={idx} className="text-sm text-amber-700 capitalize">
                    <span className="font-medium">{marking.type}</span> on{' '}
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

      {/* Distinctive Features List */}
      {analysisResult.distinctiveFeatures &&
        analysisResult.distinctiveFeatures.length > 0 && (
          <div className="card p-8 space-y-6">
            <h3 className="text-2xl font-bold text-amber-900">
              What Makes Them Unique
            </h3>
            <div className="space-y-3">
              {analysisResult.distinctiveFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200"
                >
                  <span className="text-2xl flex-shrink-0">✨</span>
                  <div>
                    <p className="font-semibold text-amber-900">
                      {feature.name}
                    </p>
                    <p className="text-sm text-amber-700">{feature.description}</p>
                    <p className="text-xs text-amber-600 mt-1">
                      {Math.round(feature.confidence * 100)}% confidence
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* CTA Button */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200 p-8 text-center">
        <button
          onClick={onConfirm}
          disabled={isGenerating}
          className={`btn-primary text-lg py-4 px-8 w-full sm:w-auto ${
            isGenerating
              ? 'opacity-75 cursor-not-allowed'
              : 'hover:shadow-xl hover:scale-105'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⚙️</span>
              Generating Pattern...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>🧶</span>
              Generate My Pattern!
              <span>✨</span>
            </span>
          )}
        </button>
        <p className="text-sm text-amber-700 mt-3">
          Your custom crochet pattern will be created in the next step
        </p>
      </div>
    </div>
  );
}
