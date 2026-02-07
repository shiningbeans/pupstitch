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
  stars: number;
  color: string;
}> = [
  {
    value: 'simplified',
    label: 'Simplified',
    description: 'Fewer details, great for beginners',
    stars: 1,
    color: 'from-amber-400 to-amber-500',
  },
  {
    value: 'standard',
    label: 'Standard',
    description: 'Full pattern with all features',
    stars: 2,
    color: 'from-amber-500 to-amber-600',
  },
  {
    value: 'detailed',
    label: 'Detailed',
    description: 'Extra texture and finishing details',
    stars: 3,
    color: 'from-amber-600 to-orange-600',
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
            className={`p-5 rounded-lg border-2 transition-all text-center ${
              difficulty === option.value
                ? 'border-amber-500 bg-amber-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-amber-300'
            }`}
          >
            <div className={`text-3xl mb-3 inline-block bg-gradient-to-r ${option.color} bg-clip-text text-transparent font-bold`}>
              {'⭐'.repeat(option.stars)}
            </div>
            <h3 className="text-lg font-bold text-warm-primary mb-2">{option.label}</h3>
            <p className="text-sm text-warm-secondary">{option.description}</p>
          </button>
        ))}
      </div>

      {difficulty === 'simplified' && (
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm text-blue-900">
            <strong>Perfect for:</strong> Beginners who want a quick, simple pattern with basic stitches
            and fewer color changes.
          </p>
        </div>
      )}

      {difficulty === 'standard' && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <p className="text-sm text-green-900">
            <strong>Perfect for:</strong> Intermediate crafters who want the full pattern with all the
            details that make your dog unique.
          </p>
        </div>
      )}

      {difficulty === 'detailed' && (
        <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
          <p className="text-sm text-purple-900">
            <strong>Perfect for:</strong> Advanced crafters who love intricate details, special stitches,
            and texture work.
          </p>
        </div>
      )}
    </div>
  );
}
