/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useMemo } from 'react';

interface BreedSelectorProps {
  selectedBreeds: string[];
  onToggle: (breed: string) => void;
  maxBreeds?: number;
}

const ALL_BREEDS = [
  'Afghan Hound', 'Akita', 'Alaskan Malamute', 'American Bulldog',
  'American Pit Bull Terrier', 'Australian Cattle Dog', 'Australian Shepherd',
  'Basenji', 'Basset Hound', 'Beagle', 'Bernese Mountain Dog', 'Bichon Frise',
  'Bloodhound', 'Border Collie', 'Border Terrier', 'Boston Terrier', 'Boxer',
  'Brittany', 'Brussels Griffon', 'Bull Terrier', 'Bulldog', 'Bullmastiff',
  'Cairn Terrier', 'Cane Corso', 'Cavalier King Charles Spaniel',
  'Chesapeake Bay Retriever', 'Chihuahua', 'Chinese Crested', 'Chinese Shar-Pei',
  'Chow Chow', 'Cocker Spaniel', 'Collie', 'Corgi (Pembroke Welsh)',
  'Corgi (Cardigan Welsh)', 'Dachshund', 'Dalmatian', 'Doberman Pinscher',
  'English Setter', 'English Springer Spaniel', 'French Bulldog',
  'German Shepherd', 'German Shorthaired Pointer', 'Golden Retriever',
  'Gordon Setter', 'Great Dane', 'Great Pyrenees', 'Greyhound', 'Havanese',
  'Irish Setter', 'Irish Wolfhound', 'Italian Greyhound', 'Jack Russell Terrier',
  'Japanese Chin', 'Keeshond', 'Labrador Retriever', 'Lhasa Apso', 'Maltese',
  'Mastiff', 'Miniature Pinscher', 'Miniature Schnauzer', 'Newfoundland',
  'Norfolk Terrier', 'Norwegian Elkhound', 'Old English Sheepdog', 'Papillon',
  'Pekingese', 'Pointer', 'Pomeranian', 'Poodle (Standard)',
  'Poodle (Miniature)', 'Poodle (Toy)', 'Portuguese Water Dog', 'Pug',
  'Rat Terrier', 'Rhodesian Ridgeback', 'Rottweiler', 'Saint Bernard',
  'Samoyed', 'Schipperke', 'Scottish Terrier', 'Shetland Sheepdog',
  'Shiba Inu', 'Shih Tzu', 'Siberian Husky', 'Silky Terrier',
  'Soft Coated Wheaten Terrier', 'Staffordshire Bull Terrier',
  'Standard Schnauzer', 'Tibetan Mastiff', 'Tibetan Terrier',
  'Toy Fox Terrier', 'Vizsla', 'Weimaraner', 'Welsh Terrier',
  'West Highland White Terrier', 'Whippet', 'Wire Fox Terrier',
  'Yorkshire Terrier',
];

export default function BreedSelector({
  selectedBreeds,
  onToggle,
  maxBreeds = 4,
}: BreedSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const atMax = selectedBreeds.length >= maxBreeds;

  const filteredBreeds = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return ALL_BREEDS;
    return ALL_BREEDS.filter((breed) => breed.toLowerCase().includes(query));
  }, [searchQuery]);

  return (
    <div className="space-y-3">
      {selectedBreeds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedBreeds.map((breed, idx) => (
            <button
              key={breed}
              onClick={() => onToggle(breed)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full text-sm font-medium text-slate-700 hover:bg-[var(--primary)]/20 transition-colors"
            >
              {idx === 0 && <span className="text-xs text-slate-400">Primary</span>}
              {breed}
              <svg className="w-3 h-3 text-slate-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
          {!atMax && (
            <span className="inline-flex items-center px-3 py-1.5 text-xs text-slate-400">
              {maxBreeds - selectedBreeds.length} more allowed
            </span>
          )}
        </div>
      )}

      <input
        type="text"
        placeholder="Search breeds..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-sm"
      />

      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden max-h-60 overflow-y-auto">
        {filteredBreeds.length > 0 ? (
          filteredBreeds.map((breed) => {
            const isSelected = selectedBreeds.includes(breed);
            const disabled = atMax && !isSelected;
            return (
              <button
                key={breed}
                onClick={() => !disabled && onToggle(breed)}
                disabled={disabled}
                className={`w-full text-left px-4 py-2.5 transition-all duration-150 text-sm border-l-2 ${
                  isSelected
                    ? 'border-l-[var(--primary)] bg-[var(--primary)]/5 font-medium text-slate-900'
                    : disabled
                      ? 'border-l-transparent text-slate-300 cursor-not-allowed'
                      : 'border-l-transparent hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{breed}</span>
                  {isSelected && (
                    <span className="text-xs text-slate-400 font-medium">
                      {selectedBreeds.indexOf(breed) === 0 ? 'Primary' : `#${selectedBreeds.indexOf(breed) + 1}`}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        ) : (
          <div className="px-4 py-4 text-center text-slate-400 text-sm">
            No breeds found matching "{searchQuery}"
          </div>
        )}
      </div>

      {selectedBreeds.length === 0 && (
        <p className="text-xs text-slate-400 text-center">
          Select 1-4 breeds (first is primary for pattern shape)
        </p>
      )}
    </div>
  );
}
