'use client';

import { DifficultyLevel } from '@/types';

interface DifficultySelectorProps {
  difficulty: DifficultyLevel;
  onChange: (level: DifficultyLevel) => void;
}

const DIFFICULTY_OPTIONS: Array<{
  value: DifficultyLevel;
  label: string;
  description: string;
  dots: number;
}> = [
  {
    value: 'simplified',
    label: 'Simplified',
    description: 'Fewer details, great for beginners',
    dots: 1,
  },
  {
    value: 'standard',
    label: 'Standard',
    description: 'Full pattern with all features',
    dots: 2,
  },
  {
    value: 'detailed',
    label: 'Detailed',
    description: 'Extra texture and finishing details',
    dots: 3,
  },
];

export default function DifficultySelector({
  difficulty,
  onChange,
}: DifficultySelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DIFFICULTY_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`p-5 rounded-xl border transition-all text-center ${
              difficulty === option.value
                ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex justify-center gap-1.5 mb-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i < option.dots
                      ? difficulty === option.value
                        ? 'bg-[var(--primary)]'
                        : 'bg-slate-400'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">{option.label}</h3>
            <p className="text-xs text-slate-500">{option.description}</p>
          </button>
        ))}
      </div>

      {difficulty === 'simplified' && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-600">
            <span className="font-semibold">Perfect for:</span> Beginners who want a quick, simple pattern with basic stitches
            and fewer color changes.
          </p>
        </div>
      )}

      {difficulty === 'standard' && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-600">
            <span className="font-semibold">Perfect for:</span> Intermediate crafters who want the full pattern with all the
            details that make your dog unique.
          </p>
        </div>
      )}

      {difficulty === 'detailed' && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-600">
            <span className="font-semibold">Perfect for:</span> Advanced crafters who love intricate details, special stitches,
            and texture work.
          </p>
        </div>
      )}
    </div>
  );
}
