'use client';

import { useState } from 'react';
import { CustomPattern } from '@/types';
import { usePatternStore } from '@/store/pattern-store';
import PatternOutput from './PatternOutput';
import ColorPanel from './ColorPanel';

interface PatternEditorProps {
  pattern: CustomPattern;
}

export default function PatternEditor({ pattern }: PatternEditorProps) {
  const [showColorPanel, setShowColorPanel] = useState(false);

  const updateColorAssignment = usePatternStore((s) => s.updateColorAssignment);
  const addColorAssignment = usePatternStore((s) => s.addColorAssignment);
  const updateBodyPartColor = usePatternStore((s) => s.updateBodyPartColor);
  const reanalyzeWithColors = usePatternStore((s) => s.reanalyzeWithColors);
  const isGenerating = usePatternStore((s) => s.isGenerating);
  const isAnalyzing = usePatternStore((s) => s.isAnalyzing);

  const handleColorChange = (colorKey: string, newColor: string) => {
    updateColorAssignment(colorKey, newColor);
  };

  const handleAddColor = (colorKey: string, hexCode: string, yarnName: string) => {
    addColorAssignment(colorKey, hexCode, yarnName);
  };

  const handleBodyPartColorChange = (partName: string, hexCode: string) => {
    updateBodyPartColor(partName, hexCode);
  };

  const handleRegenerate = async () => {
    await reanalyzeWithColors();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Color Customization Toggle */}
      <div className="print:hidden mb-6">
        <button
          onClick={() => setShowColorPanel(!showColorPanel)}
          className="w-full flex items-center justify-between px-5 py-3 bg-white rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {pattern.customizations.colorAssignments.slice(0, 5).map((a, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border-2 border-white"
                  style={{ backgroundColor: a.hexCode }}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-amber-900">
              Customize Colors
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-amber-600 transition-transform ${showColorPanel ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showColorPanel && (
          <div className="mt-3 bg-white rounded-xl border-2 border-amber-200 p-5 shadow-sm">
            <ColorPanel
              pattern={pattern}
              onColorChange={handleColorChange}
              onAddColor={handleAddColor}
              onBodyPartColorChange={handleBodyPartColorChange}
            />

            {/* Regenerate button — applies color changes to the pattern */}
            <div className="mt-6 pt-4 border-t-2 border-amber-100">
              <button
                onClick={handleRegenerate}
                disabled={isGenerating || isAnalyzing}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating || isAnalyzing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isAnalyzing ? 'Re-analyzing with your colors...' : 'Regenerating...'}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate Pattern with New Colors
                  </>
                )}
              </button>
              <p className="text-xs text-amber-500 text-center mt-2">
                Re-analyzes the photo with your color choices and regenerates the pattern
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pattern Output */}
      <PatternOutput pattern={pattern} />
    </div>
  );
}
