/* eslint-disable react/no-unescaped-entities */
'use client';

type DollSize = 'small' | 'medium' | 'large';

interface SizeSelectorProps {
  selectedSize: DollSize | null;
  onSelect: (size: DollSize) => void;
}

const SIZE_OPTIONS: Array<{
  id: DollSize;
  label: string;
  height: string;
  description: string;
  details: string;
  emoji: string;
  time: string;
  recommended?: boolean;
}> = [
  {
    id: 'small',
    label: 'Small',
    height: '4"',
    description: 'Keychain / Ornament size',
    details: 'Quick to make, great for beginners',
    emoji: '🔑',
    time: '~2-3 hours',
  },
  {
    id: 'medium',
    label: 'Medium',
    height: '8"',
    description: 'Classic amigurumi size',
    details: 'Perfect display piece',
    emoji: '🧸',
    time: '~4-6 hours',
    recommended: true,
  },
  {
    id: 'large',
    label: 'Large',
    height: '12"',
    description: 'Cuddly plush size',
    details: 'Great for gifts',
    emoji: '🎁',
    time: '~8-12 hours',
  },
];

export default function SizeSelector({
  selectedSize,
  onSelect,
}: SizeSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-amber-900 mb-4">
          Choose your plush size
        </h3>
        <p className="text-amber-700 text-sm mb-6">
          The size affects yarn weight, pattern complexity, and creation time
        </p>
      </div>

      {/* Size Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SIZE_OPTIONS.map((size) => (
          <button
            key={size.id}
            onClick={() => onSelect(size.id)}
            className={`relative p-6 rounded-xl transition-all duration-200 border-2 transform ${
              selectedSize === size.id
                ? 'border-amber-500 bg-amber-50 shadow-lg scale-105'
                : 'border-amber-200 bg-white hover:border-amber-300 hover:shadow-md'
            }`}
          >
            {/* Recommended Badge */}
            {size.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  RECOMMENDED
                </span>
              </div>
            )}

            {/* Emoji Icon */}
            <div className="text-5xl mb-4 text-center">{size.emoji}</div>

            {/* Size Label and Height */}
            <div className="text-center mb-3">
              <p className="text-2xl font-bold text-amber-900">{size.label}</p>
              <p className="text-lg text-amber-600 font-semibold">{size.height}</p>
            </div>

            {/* Description */}
            <div className="text-center mb-4 space-y-1">
              <p className="text-sm font-medium text-amber-900">
                {size.description}
              </p>
              <p className="text-xs text-amber-700">{size.details}</p>
            </div>

            {/* Time Estimate */}
            <div className="text-center pt-4 border-t border-amber-200">
              <p className="text-xs font-semibold text-amber-600 uppercase">
                Creation Time
              </p>
              <p className="text-sm text-amber-700 font-medium mt-1">
                {size.time}
              </p>
            </div>

            {/* Checkmark */}
            {selectedSize === size.id && (
              <div className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 bg-amber-500 text-white rounded-full">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Size Comparison Visualization */}
      <div className="p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200">
        <p className="text-sm font-semibold text-amber-900 mb-4">Size Comparison</p>
        <div className="space-y-3">
          <div className="flex items-end justify-around h-24 gap-2">
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full transition-all duration-200 ${
                  selectedSize === 'small'
                    ? 'bg-amber-500 ring-2 ring-amber-300'
                    : 'bg-amber-200'
                }`}
                style={{ width: '40px', height: '40px' }}
              />
              <p className="text-xs text-amber-700 mt-2">Small</p>
              <p className="text-xs font-bold text-amber-900">4"</p>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`rounded-full transition-all duration-200 ${
                  selectedSize === 'medium'
                    ? 'bg-amber-500 ring-2 ring-amber-300'
                    : 'bg-amber-200'
                }`}
                style={{ width: '60px', height: '60px' }}
              />
              <p className="text-xs text-amber-700 mt-2">Medium</p>
              <p className="text-xs font-bold text-amber-900">8"</p>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`rounded-full transition-all duration-200 ${
                  selectedSize === 'large'
                    ? 'bg-amber-500 ring-2 ring-amber-300'
                    : 'bg-amber-200'
                }`}
                style={{ width: '80px', height: '80px' }}
              />
              <p className="text-xs text-amber-700 mt-2">Large</p>
              <p className="text-xs font-bold text-amber-900">12"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Size Display */}
      {selectedSize && (
        <div className="p-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg border-2 border-amber-300">
          <p className="text-sm text-amber-700 font-medium">Selected Size:</p>
          <p className="text-xl font-bold text-amber-900">
            {SIZE_OPTIONS.find((s) => s.id === selectedSize)?.label} (
            {SIZE_OPTIONS.find((s) => s.id === selectedSize)?.height})
          </p>
        </div>
      )}
    </div>
  );
}
