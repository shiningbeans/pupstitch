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
  time: string;
  recommended?: boolean;
}> = [
  {
    id: 'small',
    label: 'Small',
    height: '4"',
    description: 'Keychain / Ornament size',
    details: 'Quick to make, great for beginners',
    time: '~2-3 hours',
  },
  {
    id: 'medium',
    label: 'Medium',
    height: '8"',
    description: 'Classic amigurumi size',
    details: 'Perfect display piece',
    time: '~4-6 hours',
    recommended: true,
  },
  {
    id: 'large',
    label: 'Large',
    height: '12"',
    description: 'Cuddly plush size',
    details: 'Great for gifts',
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
        <h3 className="text-base font-semibold text-stone-900 mb-3">Choose your plush size</h3>
        <p className="text-stone-500 text-sm mb-6">The size affects yarn weight, pattern complexity, and creation time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SIZE_OPTIONS.map((size) => (
          <button
            key={size.id}
            onClick={() => onSelect(size.id)}
            className={`relative p-6 rounded-xl transition-all duration-200 border text-center ${
              selectedSize === size.id
                ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            {size.recommended && (
              <div className="absolute -top-3 left-1/2 transform -transtone-x-1/2">
                <span className="inline-block bg-[var(--primary)] text-white text-xs font-bold px-3 py-1 rounded-full">
                  RECOMMENDED
                </span>
              </div>
            )}

            <div className="mb-3">
              <p className="text-2xl font-bold text-stone-900">{size.label}</p>
              <p className="text-lg text-stone-500 font-semibold">{size.height}</p>
            </div>

            <div className="mb-4 space-y-1">
              <p className="text-sm font-medium text-stone-700">{size.description}</p>
              <p className="text-xs text-stone-400">{size.details}</p>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <p className="text-xs font-semibold text-stone-400 uppercase">Creation Time</p>
              <p className="text-sm text-stone-600 font-medium mt-1">{size.time}</p>
            </div>

            {selectedSize === size.id && (
              <div className="absolute top-4 right-4 flex items-center justify-center w-6 h-6 bg-[var(--primary)] text-white rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="p-6 bg-stone-50 rounded-xl border border-stone-200">
        <p className="text-sm font-semibold text-stone-700 mb-4">Size Comparison</p>
        <div className="flex items-end justify-around h-24 gap-2">
          {(['small', 'medium', 'large'] as const).map((sizeId) => {
            const sizes = { small: 40, medium: 60, large: 80 };
            const heights = { small: '4"', medium: '8"', large: '12"' };
            return (
              <div key={sizeId} className="flex flex-col items-center">
                <div
                  className={`rounded-full transition-all duration-200 ${
                    selectedSize === sizeId ? 'bg-[var(--primary)]' : 'bg-stone-200'
                  }`}
                  style={{ width: `${sizes[sizeId]}px`, height: `${sizes[sizeId]}px` }}
                />
                <p className="text-xs text-stone-500 mt-2 capitalize">{sizeId}</p>
                <p className="text-xs font-bold text-stone-700">{heights[sizeId]}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
