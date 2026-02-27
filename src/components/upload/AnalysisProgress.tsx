'use client';

import { useState, useEffect } from 'react';

interface AnalysisProgressProps {
  uploadedImage: string;
}

const messages = [
  'Detecting breed...',
  'Analyzing markings...',
  'Measuring ear shape...',
  'Studying proportions...',
  'Checking color patterns...',
  'Mapping unique features...',
  'Almost done analyzing...',
];

export default function AnalysisProgress({
  uploadedImage,
}: AnalysisProgressProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={uploadedImage} alt="Dog photo being analyzed" className="w-full h-72 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Analyzing Your Dog</h2>
            <p className="text-slate-500">
              Identifying unique characteristics and features...
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex-shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--primary)] border-r-[var(--primary)] animate-spin" />
            </div>
            <div className="flex-1">
              <div className="mb-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] animate-pulse rounded-full" />
              </div>
              <p className="text-slate-600 font-medium text-sm min-h-5">
                {messages[messageIndex]}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {[
              { label: 'Breed Detection', done: true },
              { label: 'Color Analysis', done: messageIndex > 1 },
              { label: 'Feature Extraction', done: messageIndex > 3 },
              { label: 'Proportions Measured', done: messageIndex > 5 },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step.done
                      ? 'bg-[var(--success)] text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step.done ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`text-sm ${step.done ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
