'use client';

interface PreviewPickerProps {
  options: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export default function PreviewPicker({ options, selectedIndex, onSelect }: PreviewPickerProps) {
  // If a selection has been made, show just the chosen image
  if (selectedIndex !== null && options[selectedIndex]) {
    return (
      <div className="relative">
        <img
          src={options[selectedIndex]}
          alt="Selected design"
          className="w-full h-full object-contain p-6"
        />
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-sm">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Design {selectedIndex === 0 ? 'A' : 'B'}
        </div>
      </div>
    );
  }

  // Show both options side-by-side for the user to choose
  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">Which design do you prefer?</p>
        <p className="text-xs text-slate-400 mt-0.5">Pick the one that best represents your dog</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((url, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className="group relative rounded-xl overflow-hidden border-2 border-slate-200 hover:border-[var(--primary)] transition-all duration-200 hover:shadow-md bg-gradient-to-br from-slate-50 to-white"
          >
            <div className="aspect-square flex items-center justify-center p-3">
              <img
                src={url}
                alt={`Design option ${idx === 0 ? 'A' : 'B'}`}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="px-4 py-1.5 bg-[var(--primary)] text-white text-xs font-bold rounded-full shadow-lg">
                Choose This
              </span>
            </div>
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-600 rounded-md border border-slate-200">
              {idx === 0 ? 'A' : 'B'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
