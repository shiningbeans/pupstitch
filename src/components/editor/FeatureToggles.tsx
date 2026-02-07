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
    icon: '🎨',
  },
  {
    key: 'facialMarkings',
    label: 'Facial Markings',
    description: 'Mask or blaze on face',
    icon: '😺',
  },
  {
    key: 'pawMarkings',
    label: 'Paw Markings',
    description: 'Socks or paw tips',
    icon: '🐾',
  },
  {
    key: 'eyePatches',
    label: 'Eye Patches',
    description: 'Color around the eyes',
    icon: '👀',
  },
  {
    key: 'collar',
    label: 'Collar Accessory',
    description: 'Crocheted collar detail',
    icon: '🎀',
  },
  {
    key: 'bandana',
    label: 'Bow or Bandana',
    description: 'Decorative bow or bandana',
    icon: '🎗️',
  },
];

export default function FeatureToggles({ pattern, onToggle }: FeatureTogglesProps) {
  const toggledFeatures = pattern.customizations.toggledFeatures || {};

  return (
    <div className="space-y-3">
      {FEATURES.map((feature) => {
        const isEnabled = toggledFeatures[feature.key] !== false;
        const isDetected = true; // In a real app, check if feature was detected in image

        return (
          <div
            key={feature.key}
            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
              isEnabled
                ? 'bg-amber-50 border-amber-300'
                : 'bg-gray-50 border-gray-200 opacity-60'
            } ${!isDetected ? 'opacity-50' : ''}`}
          >
            <div className="text-2xl mt-1">{feature.icon}</div>
            <div className="flex-1 min-w-0">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => onToggle(feature.key, e.target.checked)}
                  disabled={!isDetected}
                  className="w-5 h-5 rounded border-amber-300 text-amber-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="ml-3 font-medium text-warm-primary">{feature.label}</span>
              </label>
              <p className="text-xs text-warm-secondary mt-1">{feature.description}</p>
              {!isDetected && (
                <p className="text-xs text-gray-500 mt-2 italic">Not detected in your dog&apos;s photo</p>
              )}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-gray-500 mt-6 p-3 bg-gray-50 rounded">
        Features can be toggled on or off. Detected features are enabled by default. You can customize which details appear in your pattern.
      </p>
    </div>
  );
}
