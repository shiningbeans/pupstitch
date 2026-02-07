'use client';

import { useRef } from 'react';
import { CustomPattern } from '@/types';
import { getAbbreviations } from '@/lib/patterns/formatter';

interface PatternOutputProps {
  pattern: CustomPattern;
}

export default function PatternOutput({ pattern }: PatternOutputProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const abbreviations = getAbbreviations();
  const gen = pattern.generatedPattern;
  const mat = pattern.materials;
  const assembly = gen.assemblyInstructions || [];

  return (
    <div>
      {/* Pattern Preview Label - hidden when printing */}
      <div className="print:hidden mb-6 sticky top-[73px] z-30 bg-gradient-honey py-3 -mx-4 px-4 border-b border-amber-200">
        <h2 className="text-xl font-bold text-amber-900">Pattern Preview</h2>
        <p className="text-sm text-amber-600 mt-1">Use the Download PDF button above to get your printable pattern.</p>
      </div>

      {/* Printable pattern document */}
      <div ref={printRef} className="pattern-document bg-white rounded-xl border-2 border-amber-100 print:border-0 print:rounded-none print:shadow-none">

        {/* Title & Header */}
        <div className="p-6 sm:p-8 border-b-2 border-amber-100 print:border-b print:border-gray-300">
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-900 print:text-black mb-1">
            {gen.title}
          </h1>
          <p className="text-amber-700 print:text-gray-600 text-sm mb-4">{gen.description}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="px-3 py-1 bg-amber-50 print:bg-gray-100 rounded-full text-amber-800 print:text-gray-700 font-medium">
              Skill: {gen.skillLevel}
            </span>
            <span className="px-3 py-1 bg-amber-50 print:bg-gray-100 rounded-full text-amber-800 print:text-gray-700 font-medium">
              Time: ~{Math.round(gen.estimatedTotalTime)} hours
            </span>
            <span className="px-3 py-1 bg-amber-50 print:bg-gray-100 rounded-full text-amber-800 print:text-gray-700 font-medium">
              Hook: {mat.hookSize}
            </span>
          </div>
        </div>

        {/* Materials */}
        <div className="p-6 sm:p-8 border-b-2 border-amber-100 print:border-b print:border-gray-300">
          <h2 className="text-lg font-bold text-amber-900 print:text-black mb-4 uppercase tracking-wide">
            Materials
          </h2>

          {/* Yarn */}
          <div className="mb-4">
            <h3 className="font-semibold text-amber-800 print:text-gray-800 mb-2 text-sm">Yarn ({mat.yarns[0]?.weight || 'worsted'} weight)</h3>
            <div className="space-y-1.5">
              {mat.yarns.map((yarn, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0 print:border-gray-400"
                    style={{ backgroundColor: yarn.hexCode }}
                  />
                  <span className="text-amber-900 print:text-black">
                    {yarn.name} — {yarn.yardage} yards
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-amber-600 print:text-gray-500 mt-2">
              Total yardage: {mat.totalYardageNeeded} yards
            </p>
          </div>

          {/* Tools & Notions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-amber-800 print:text-gray-800 mb-1 text-sm">Tools</h3>
              <p className="text-amber-900 print:text-black">Crochet hook: {mat.hookSize}</p>
              {mat.notions.map((n, i) => (
                <p key={i} className="text-amber-900 print:text-black">
                  {n.name} ({n.quantity} {n.unit})
                </p>
              ))}
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 print:text-gray-800 mb-1 text-sm">Supplies</h3>
              <p className="text-amber-900 print:text-black">{mat.stuffingType}: ~{mat.stuffingAmount} oz</p>
              {(mat.additionalSupplies || []).map((s, i) => (
                <p key={i} className="text-amber-900 print:text-black">{s}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Abbreviations */}
        <div className="p-6 sm:p-8 border-b-2 border-amber-100 print:border-b print:border-gray-300">
          <h2 className="text-lg font-bold text-amber-900 print:text-black mb-3 uppercase tracking-wide">
            Abbreviations
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm">
            {Object.entries(abbreviations).map(([abbr, full]) => (
              <div key={abbr}>
                <span className="font-mono font-bold text-amber-800 print:text-black">{abbr}</span>
                <span className="text-amber-700 print:text-gray-600"> = {full}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pattern Sections */}
        <div className="p-6 sm:p-8 border-b-2 border-amber-100 print:border-b print:border-gray-300">
          <h2 className="text-lg font-bold text-amber-900 print:text-black mb-6 uppercase tracking-wide">
            Pattern Instructions
          </h2>

          <div className="space-y-8">
            {gen.sections.map((section, sIdx) => (
              <div key={sIdx} className="print:break-inside-avoid">
                <h3 className="text-base font-bold text-amber-900 print:text-black mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 bg-amber-100 print:bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-amber-700 print:text-gray-700">
                    {sIdx + 1}
                  </span>
                  {section.name}
                </h3>
                {section.notes && (
                  <p className="text-xs text-amber-600 print:text-gray-500 mb-2 ml-8 italic">
                    {section.notes}
                  </p>
                )}
                <div className="ml-8 space-y-0.5">
                  {section.instructions.map((inst, iIdx) => (
                    <div
                      key={iIdx}
                      className={`text-sm font-mono py-1 px-2 rounded ${
                        iIdx % 2 === 0
                          ? 'bg-amber-50/50 print:bg-gray-50'
                          : ''
                      }`}
                    >
                      <span className="text-amber-900 print:text-black">
                        {inst.instruction}
                      </span>
                      {inst.notes && (
                        <span className="text-amber-500 print:text-gray-400 text-xs ml-2">
                          [{inst.notes}]
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {section.estimatedTime > 0 && (
                  <p className="text-xs text-amber-500 print:text-gray-400 mt-1 ml-8">
                    ~{section.estimatedTime.toFixed(1)} hours
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Assembly */}
        {assembly.length > 0 && (
          <div className="p-6 sm:p-8 border-b-2 border-amber-100 print:border-b print:border-gray-300">
            <h2 className="text-lg font-bold text-amber-900 print:text-black mb-4 uppercase tracking-wide">
              Assembly Instructions
            </h2>
            <ol className="space-y-2">
              {assembly.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm print:break-inside-avoid">
                  <span className="w-6 h-6 bg-amber-100 print:bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-amber-700 print:text-gray-700 flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-amber-900 print:text-black">{step.replace(/^\d+\.\s*/, '')}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Notes */}
        {gen.notes && (
          <div className="p-6 sm:p-8 border-b-2 border-amber-100 print:border-b print:border-gray-300">
            <h2 className="text-lg font-bold text-amber-900 print:text-black mb-2 uppercase tracking-wide">
              Notes
            </h2>
            <p className="text-sm text-amber-800 print:text-gray-700">{gen.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 sm:p-8 text-center text-xs text-amber-500 print:text-gray-400">
          <p>Generated by PupStitch — {new Date().toLocaleDateString()}</p>
          <p className="mt-1">Custom amigurumi pattern for your pup</p>
        </div>
      </div>
    </div>
  );
}
