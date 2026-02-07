'use client';

import { CustomPattern } from '@/types';

interface ProportionSlidersProps {
  pattern: CustomPattern;
  onProportionChange: (bodyPart: string, value: number) => void;
}

const PROPORTIONS = [
  {
    key: 'headSize',
    label: 'Head Size',
    min: 0.7,
    max: 1.3,
    step: 0.05,
    description: 'Make the head larger or smaller',
  },
  {
    key: 'bodyLength',
    label: 'Body Length',
    min: 0.7,
    max: 1.3,
    step: 0.05,
    description: 'Adjust the overall body proportions',
  },
  {
    key: 'legLength',
    label: 'Leg Length',
    min: 0.7,
    max: 1.3,
    step: 0.05,
    description: 'Make legs longer or shorter',
  },
  {
    key: 'earSize',
    label: 'Ear Size',
    min: 0.7,
    max: 1.3,
    step: 0.05,
    description: 'Control ear proportions',
  },
  {
    key: 'tailLength',
    label: 'Tail Length',
    min: 0.7,
    max: 1.3,
    step: 0.05,
    description: 'Adjust tail size',
  },
  {
    key: 'overallSize',
    label: 'Overall Size',
    min: 0.8,
    max: 1.5,
    step: 0.1,
    description: 'Scale the entire amigurumi',
  },
];

export default function ProportionSliders({
  pattern,
  onProportionChange,
}: ProportionSlidersProps) {
  const adjustments = pattern.customizations.proportionAdjustments || {};

  const handleReset = () => {
    // Reset all to 1.0
    PROPORTIONS.forEach((prop) => {
      onProportionChange(prop.key, 1.0);
    });
  };

  return (
    <div className="space-y-6">
      {PROPORTIONS.map((prop) => {
        const currentValue = adjustments[prop.key] || 1.0;
        const percentage = Math.round((currentValue - 1) * 100);

        return (
          <div key={prop.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-warm-primary">
                  {prop.label}
                </label>
                <p className="text-xs text-warm-secondary mt-1">{prop.description}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-amber-600">{currentValue.toFixed(2)}x</p>
                {percentage !== 0 && (
                  <p className="text-xs text-warm-secondary">
                    {percentage > 0 ? '+' : ''}{percentage}%
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 whitespace-nowrap">Smaller</span>
              <input
                type="range"
                min={prop.min}
                max={prop.max}
                step={prop.step}
                value={currentValue}
                onChange={(e) => onProportionChange(prop.key, parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:bg-gray-300 transition-colors"
              />
              <span className="text-xs text-gray-500 whitespace-nowrap">Bigger</span>
            </div>
          </div>
        );
      })}

      <button
        onClick={handleReset}
        className="w-full px-4 py-3 bg-white border-2 border-amber-200 text-amber-700 font-medium rounded-lg hover:bg-amber-50 transition-all"
      >
        Reset to Default
      </button>

      <p className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
        These adjustments let you match the proportions of your specific dog. Changes are reflected in the preview on the left.
      </p>
    </div>
  );
}
