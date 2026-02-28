'use client';

import { CustomPattern } from '@/types';

interface FeatureTogglesProps {
  pattern: CustomPattern;
  onToggle: (feature: string, enabled: boolean) => void;
}

const FEATURES = [
  {
    key: 'spots',
    label: 'Spots & Patches',
    description: 'Color spots and patches on body',
  },
  {
    key: 'facialMarkings',
    label: 'Facial Markings',
    description: 'Mask or blaze on face',
  },
  {
    key: 'pawMarkings',
    label: 'Paw Markings',
    description: 'Socks or paw tips',
  },
  {
    key: 'eyePatches',
    label: 'Eye Patches',
    description: 'Color around the eyes',
  },
  {
    key: 'collar',
    label: 'Collar Accessory',
    description: 'Crocheted collar detail',
  },
  {
    key: 'bandana',
    label: 'Bow or Bandana',
    description: 'Decorative bow or bandana',
  },
];

export default function FeatureToggles({ pattern, onToggle }: FeatureTogglesProps) {
  const toggledFeatures = pattern.customizations.toggledFeatures || {};

  return (
    <div className="space-y-3">
      {FEATURES.map((feature) => {
        const isEnabled = toggledFeatures[feature.key] !== false;
        const isDetected = true;

        return (
          <div
            key={feature.key}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
              isEnabled
                ? 'bg-[var(--primary)]/5 border-[var(--primary)]/30'
                : 'bg-stone-50 border-stone-200 opacity-60'
            } ${!isDetected ? 'opacity-50' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => onToggle(feature.key, e.target.checked)}
                  disabled={!isDetected}
                  className="w-5 h-5 rounded border-stone-300 text-[var(--primary)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed accent-[var(--primary)]"
                />
                <span className="ml-3 font-medium text-stone-900">{feature.label}</span>
              </label>
              <p className="text-xs text-stone-500 mt-1 ml-8">{feature.description}</p>
              {!isDetected && (
                <p className="text-xs text-stone-400 mt-2 ml-8 italic">Not detected in your dog&apos;s photo</p>
              )}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-stone-500 mt-6 p-3 bg-stone-50 rounded-lg border border-stone-100">
        Features can be toggled on or off. Detected features are enabled by default. You can customize which details appear in your pattern.
      </p>
    </div>
  );
}
