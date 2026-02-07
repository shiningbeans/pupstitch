'use client';

import { useState } from 'react';
import { CustomPattern } from '@/types';
import {
  formatPatternText,
  formatMaterialsList,
  getAbbreviations,
} from '@/lib/patterns/formatter';

interface ExportModalProps {
  pattern: CustomPattern;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ pattern, isOpen, onClose }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'txt'>('pdf');
  const [patternName, setPatternName] = useState(pattern.name);
  const [includePhotos, setIncludePhotos] = useState(false);

  const handleExport = async () => {
    try {
      if (exportFormat === 'txt') {
        // Generate text file
        const abbreviations = getAbbreviations();
        const abbrevText = Object.entries(abbreviations)
          .map(([abbrev, full]) => `${abbrev} = ${full}`)
          .join('\n');

        const materialsText = formatMaterialsList(pattern.materials);
        const patternText = formatPatternText(pattern.generatedPattern);
        const assemblyText = (pattern.generatedPattern.assemblyInstructions || [])
          .map((instr, i) => `${i + 1}. ${instr}`)
          .join('\n');

        let content = `${patternName}\n${'='.repeat(patternName.length)}\n\n`;
        content += `Breed: ${pattern.breedId}\n`;
        content += `Difficulty: ${pattern.customizations.difficultyLevel}\n`;
        content += `Date Generated: ${new Date().toLocaleDateString()}\n\n`;
        content += `${materialsText}\n\n${abbrevText}\n\n${patternText}\n\n## Assembly\n\n${assemblyText}`;

        // Download as text file
        const element = document.createElement('a');
        element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
        element.setAttribute('download', `${patternName.replace(/\s+/g, '_')}.txt`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } else if (exportFormat === 'pdf') {
        // PDF export would require jsPDF library
        // For now, show a message
        alert(
          'PDF export feature is coming soon! For now, you can download as text and open in Word to save as PDF.'
        );
      }
      onClose();
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-warm-primary">Export Pattern</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Pattern Name */}
          <div>
            <label className="block text-sm font-semibold text-warm-primary mb-2">
              Pattern Name
            </label>
            <input
              type="text"
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
              className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-semibold text-warm-primary mb-3">
              Export Format
            </label>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="txt"
                  checked={exportFormat === 'txt'}
                  onChange={(e) => setExportFormat(e.target.value as 'txt')}
                  className="w-4 h-4 text-amber-600"
                />
                <span className="ml-3 font-medium text-warm-primary">
                  Plain Text (.txt)
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-7">
                Download as a text file. Perfect for printing or opening in Word.
              </p>

              <label className="flex items-center cursor-pointer mt-3">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value as 'pdf')}
                  className="w-4 h-4 text-amber-600"
                />
                <span className="ml-3 font-medium text-warm-primary">
                  PDF (.pdf)
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-7">
                Download as PDF (coming soon)
              </p>
            </div>
          </div>

          {/* Include Photos */}
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includePhotos}
                onChange={(e) => setIncludePhotos(e.target.checked)}
                className="w-4 h-4 rounded border-amber-300 text-amber-600"
              />
              <span className="ml-3 text-sm font-medium text-warm-primary">
                Include dog photo
              </span>
            </label>
            <p className="text-xs text-gray-500 ml-7 mt-1">
              Add your dog&apos;s photo to the pattern (PDF only)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-amber-200 text-amber-700 font-medium rounded-lg hover:bg-amber-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-white font-medium rounded-lg hover:from-amber-600 hover:to-amber-500 transition-all"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
