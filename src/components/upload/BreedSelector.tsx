/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useMemo } from 'react';

interface BreedSelectorProps {
  selectedBreeds: string[];
  onToggle: (breed: string) => void;
  maxBreeds?: number;
}

// Comprehensive list of dog breeds organized alphabetically
const ALL_BREEDS = [
  'Afghan Hound',
  'Akita',
  'Alaskan Malamute',
  'American Bulldog',
  'American Pit Bull Terrier',
  'Australian Cattle Dog',
  'Australian Shepherd',
  'Basenji',
  'Basset Hound',
  'Beagle',
  'Bernese Mountain Dog',
  'Bichon Frise',
  'Bloodhound',
  'Border Collie',
  'Border Terrier',
  'Boston Terrier',
  'Boxer',
  'Brittany',
  'Brussels Griffon',
  'Bull Terrier',
  'Bulldog',
  'Bullmastiff',
  'Cairn Terrier',
  'Cane Corso',
  'Cavalier King Charles Spaniel',
  'Chesapeake Bay Retriever',
  'Chihuahua',
  'Chinese Crested',
  'Chinese Shar-Pei',
  'Chow Chow',
  'Cocker Spaniel',
  'Collie',
  'Corgi (Pembroke Welsh)',
  'Corgi (Cardigan Welsh)',
  'Dachshund',
  'Dalmatian',
  'Doberman Pinscher',
  'English Setter',
  'English Springer Spaniel',
  'French Bulldog',
  'German Shepherd',
  'German Shorthaired Pointer',
  'Golden Retriever',
  'Gordon Setter',
  'Great Dane',
  'Great Pyrenees',
  'Greyhound',
  'Havanese',
  'Irish Setter',
  'Irish Wolfhound',
  'Italian Greyhound',
  'Jack Russell Terrier',
  'Japanese Chin',
  'Keeshond',
  'Labrador Retriever',
  'Lhasa Apso',
  'Maltese',
  'Mastiff',
  'Miniature Pinscher',
  'Miniature Schnauzer',
  'Newfoundland',
  'Norfolk Terrier',
  'Norwegian Elkhound',
  'Old English Sheepdog',
  'Papillon',
  'Pekingese',
  'Pointer',
  'Pomeranian',
  'Poodle (Standard)',
  'Poodle (Miniature)',
  'Poodle (Toy)',
  'Portuguese Water Dog',
  'Pug',
  'Rat Terrier',
  'Rhodesian Ridgeback',
  'Rottweiler',
  'Saint Bernard',
  'Samoyed',
  'Schipperke',
  'Scottish Terrier',
  'Shetland Sheepdog',
  'Shiba Inu',
  'Shih Tzu',
  'Siberian Husky',
  'Silky Terrier',
  'Soft Coated Wheaten Terrier',
  'Staffordshire Bull Terrier',
  'Standard Schnauzer',
  'Tibetan Mastiff',
  'Tibetan Terrier',
  'Toy Fox Terrier',
  'Vizsla',
  'Weimaraner',
  'Welsh Terrier',
  'West Highland White Terrier',
  'Whippet',
  'Wire Fox Terrier',
  'Yorkshire Terrier',
];

export default function BreedSelector({
  selectedBreeds,
  onToggle,
  maxBreeds = 4,
}: BreedSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const atMax = selectedBreeds.length >= maxBreeds;

  // Filter breeds based on search query
  const filteredBreeds = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return ALL_BREEDS;
    return ALL_BREEDS.filter((breed) => breed.toLowerCase().includes(query));
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      {/* Selected Breeds Chips */}
      {selectedBreeds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedBreeds.map((breed, idx) => (
            <button
              key={breed}
              onClick={() => onToggle(breed)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 border-2 border-amber-400 rounded-full text-sm font-semibold text-amber-900 hover:bg-amber-200 transition-colors"
            >
              {idx === 0 && <span className="text-xs text-amber-600">Primary</span>}
              {breed}
              <span className="text-amber-500 ml-1">x</span>
            </button>
          ))}
          {!atMax && (
            <span className="inline-flex items-center px-3 py-1.5 text-xs text-amber-500 italic">
              {maxBreeds - selectedBreeds.length} more allowed
            </span>
          )}
        </div>
      )}

      {/* Search Input */}
      <div>
        <input
          type="text"
          placeholder="Search breeds..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-amber-200 rounded-lg bg-white text-amber-900 placeholder-amber-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm"
        />
      </div>

      {/* Breed List */}
      <div className="border-2 border-amber-200 rounded-lg bg-white overflow-hidden max-h-60 overflow-y-auto">
        {filteredBreeds.length > 0 ? (
          filteredBreeds.map((breed) => {
            const isSelected = selectedBreeds.includes(breed);
            const disabled = atMax && !isSelected;
            return (
              <button
                key={breed}
                onClick={() => !disabled && onToggle(breed)}
                disabled={disabled}
                className={`w-full text-left px-4 py-2.5 transition-all duration-150 border-l-4 text-sm ${
                  isSelected
                    ? 'border-l-amber-500 bg-amber-50 font-semibold text-amber-900'
                    : disabled
                      ? 'border-l-transparent text-amber-400 cursor-not-allowed'
                      : 'border-l-transparent hover:bg-amber-50/50 text-amber-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{breed}</span>
                  {isSelected && (
                    <span className="text-amber-600 font-bold text-xs">
                      {selectedBreeds.indexOf(breed) === 0 ? 'Primary' : `#${selectedBreeds.indexOf(breed) + 1}`}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        ) : (
          <div className="px-4 py-4 text-center text-amber-600 text-sm">
            No breeds found matching "{searchQuery}"
          </div>
        )}
      </div>

      {selectedBreeds.length === 0 && (
        <p className="text-xs text-amber-500 italic text-center">
          Select 1-4 breeds (first is primary for pattern shape)
        </p>
      )}
    </div>
  );
}
