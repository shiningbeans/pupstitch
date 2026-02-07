'use client';

import { useState, useEffect } from 'react';

interface AnalysisProgressProps {
  uploadedImage: string;
}

const messages = [
  'Detecting breed...',
  'Analyzing markings...',
  'Measuring those adorable ears...',
  'Studying that tail wag...',
  'Checking color patterns...',
  'Understanding proportions...',
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
        {/* Image Section */}
        <div className="flex justify-center">
          <div className="relative rounded-2xl overflow-hidden border-2 border-amber-200 bg-white shadow-lg max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedImage}
              alt="Dog photo being analyzed"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </div>

        {/* Analysis Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-amber-900 mb-4">
              AI Analysis in Progress
            </h2>
            <p className="text-amber-700 text-lg">
              We&apos;re carefully analyzing your pup&apos;s unique characteristics...
            </p>
          </div>

          {/* Animated Spinner */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <div className="absolute inset-0 rounded-full border-4 border-amber-200" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 border-r-amber-500 animate-spin" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-50 to-transparent flex items-center justify-center text-2xl">
                🐕
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-3 h-2 bg-amber-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 animate-pulse" />
              </div>
              <p className="text-amber-700 font-semibold text-lg min-h-7">
                {messages[messageIndex]}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="space-y-3 pt-4">
            {[
              { label: 'Breed Detection', done: true },
              { label: 'Color Analysis', done: messageIndex > 1 },
              { label: 'Feature Extraction', done: messageIndex > 3 },
              { label: 'Proportions Measured', done: messageIndex > 5 },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step.done
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {step.done ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-sm font-medium ${
                    step.done ? 'text-amber-700' : 'text-amber-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Decorative elements */}
          <div className="flex gap-2 pt-4">
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>
              🎨
            </span>
            <span
              className="text-2xl animate-bounce"
              style={{ animationDelay: '0.2s' }}
            >
              🧶
            </span>
            <span
              className="text-2xl animate-bounce"
              style={{ animationDelay: '0.4s' }}
            >
              🐕
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
