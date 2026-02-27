'use client';

import { useRef } from 'react';
import { CustomPattern } from '@/types';
import { getAbbreviations } from '@/lib/patterns/formatter';
import { BRAND } from '@/lib/brand';

interface PatternOutputProps { pattern: CustomPattern; }

export default function PatternOutput({ pattern }: PatternOutputProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const abbreviations = getAbbreviations();
  const gen = pattern.generatedPattern;
  const mat = pattern.materials;
  const assembly = gen.assemblyInstructions || [];

  return (
    <div>
      <div className="print:hidden mb-6 sticky top-[73px] z-30 bg-white/30 backdrop-blur-md py-3 -mx-4 px-4 border-b border-white/60">
        <h2 className="text-lg font-semibold text-slate-900">Pattern Preview</h2>
        <p className="text-sm text-slate-500 mt-0.5">Download PDF for your printable pattern.</p>
      </div>

      <div ref={printRef} className="rounded-2xl border border-white/70 backdrop-blur-sm bg-white/50 overflow-hidden print:border-0 print:rounded-none print:shadow-none print:bg-white print:backdrop-blur-none">
        <div className="p-6 sm:p-8 border-b border-white/60 print:border-b print:border-gray-300 print:bg-white">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 print:text-black mb-2">{gen.title}</h1>
          <p className="text-slate-600 print:text-gray-700 text-sm mb-5">{gen.description}</p>
          <div className="flex flex-wrap gap-2.5 text-sm">
            <span className="px-3.5 py-1.5 bg-slate-100/60 print:bg-gray-100 rounded-lg text-slate-700 print:text-gray-700 font-medium text-xs tracking-wide">Skill: {gen.skillLevel}</span>
            <span className="px-3.5 py-1.5 bg-slate-100/60 print:bg-gray-100 rounded-lg text-slate-700 print:text-gray-700 font-medium text-xs tracking-wide">Time: ~{Math.round(gen.estimatedTotalTime)} hrs</span>
            <span className="px-3.5 py-1.5 bg-slate-100/60 print:bg-gray-100 rounded-lg text-slate-700 print:text-gray-700 font-medium text-xs tracking-wide">Hook: {mat.hookSize}</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 border-b border-white/60 print:border-b print:border-gray-300 print:bg-white">
          <h2 className="text-sm font-bold text-slate-900 print:text-black mb-5 uppercase tracking-widest">Materials</h2>
          <div className="mb-5">
            <h3 className="font-semibold text-slate-800 print:text-gray-900 mb-3 text-sm">Yarn ({mat.yarns[0]?.weight || 'worsted'} weight)</h3>
            <div className="space-y-2">
              {mat.yarns.map((yarn, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-4 h-4 rounded-full border border-slate-300/50 flex-shrink-0 print:border-gray-400 shadow-sm" style={{ backgroundColor: yarn.hexCode }} />
                  <span className="text-slate-900 print:text-black font-medium">{yarn.name}</span>
                  <span className="text-slate-500 print:text-gray-600">—</span>
                  <span className="text-slate-600 print:text-gray-700">{yarn.yardage} yards</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 print:text-gray-600 mt-2.5 font-medium">Total: {mat.totalYardageNeeded} yards</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div>
              <h3 className="font-semibold text-slate-800 print:text-gray-900 mb-2 text-sm">Tools</h3>
              <p className="text-slate-900 print:text-black">Hook: {mat.hookSize}</p>
              {mat.notions.map((n, i) => <p key={i} className="text-slate-700 print:text-gray-800">{n.name} ({n.quantity} {n.unit})</p>)}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 print:text-gray-900 mb-2 text-sm">Supplies</h3>
              <p className="text-slate-900 print:text-black">{mat.stuffingType}: ~{mat.stuffingAmount} oz</p>
              {(mat.additionalSupplies || []).map((s, i) => <p key={i} className="text-slate-700 print:text-gray-800">{s}</p>)}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 border-b border-white/60 print:border-b print:border-gray-300 print:bg-white">
          <h2 className="text-sm font-bold text-slate-900 print:text-black mb-4 uppercase tracking-widest">Abbreviations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
            {Object.entries(abbreviations).map(([abbr, full]) => (
              <div key={abbr}>
                <span className="font-mono font-bold text-slate-800 print:text-black">{abbr}</span>
                <span className="text-slate-500 print:text-gray-600"> = {full}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8 border-b border-white/60 print:border-b print:border-gray-300 print:bg-white">
          <h2 className="text-sm font-bold text-slate-900 print:text-black mb-6 uppercase tracking-widest">Pattern Instructions</h2>
          <div className="space-y-7">
            {gen.sections.map((section, sIdx) => (
              <div key={sIdx} className="print:break-inside-avoid">
                <h3 className="text-sm font-bold text-slate-900 print:text-black mb-2.5 flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-slate-200/60 print:bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-700 print:text-gray-800">{sIdx + 1}</span>
                  {section.name}
                </h3>
                {section.notes && (
                  <div className="ml-8 mb-2.5 text-xs space-y-1">
                    {section.notes.split('. ').filter(Boolean).map((note, nIdx) => {
                      const trimmed = note.trim().replace(/\.$/, '');
                      if (!trimmed) return null;
                      if (trimmed.startsWith('With ') && trimmed.includes('yarn')) {
                        return <p key={nIdx} className="text-slate-800 print:text-gray-800 font-semibold">{trimmed}.</p>;
                      }
                      return <p key={nIdx} className="text-slate-500 print:text-gray-600 italic">{trimmed}.</p>;
                    })}
                  </div>
                )}
                <div className="ml-8 space-y-1">
                  {section.instructions.map((inst, iIdx) => (
                    <div key={iIdx} className={`text-sm font-mono py-2 px-2.5 rounded ${iIdx % 2 === 0 ? 'bg-slate-100/40 print:bg-gray-50' : ''}`}>
                      <span className="text-slate-900 print:text-black">{inst.instruction}</span>
                      {inst.notes && <span className="text-slate-400 print:text-gray-500 text-xs ml-2">[{inst.notes}]</span>}
                    </div>
                  ))}
                </div>
                {section.estimatedTime > 0 && <p className="text-xs text-slate-500 print:text-gray-600 mt-1.5 ml-8 font-medium">~{section.estimatedTime.toFixed(1)} hours</p>}
              </div>
            ))}
          </div>
        </div>

        {assembly.length > 0 && (
          <div className="p-6 sm:p-8 border-b border-white/60 print:border-b print:border-gray-300 print:bg-white">
            <h2 className="text-sm font-bold text-slate-900 print:text-black mb-4 uppercase tracking-widest">Assembly Instructions</h2>
            <ol className="space-y-2">
              {assembly.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm print:break-inside-avoid">
                  <span className="w-6 h-6 bg-slate-200/60 print:bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-700 print:text-gray-800 flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-slate-900 print:text-black">{step.replace(/^\d+\.\s*/, '')}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {gen.notes && (
          <div className="p-6 sm:p-8 border-b border-white/60 print:border-b print:border-gray-300 print:bg-white">
            <h2 className="text-sm font-bold text-slate-900 print:text-black mb-3 uppercase tracking-widest">Notes</h2>
            <p className="text-sm text-slate-700 print:text-gray-800">{gen.notes}</p>
          </div>
        )}

        <div className="p-6 sm:p-8 text-center text-xs text-slate-500 print:text-gray-600 print:bg-white bg-slate-50/30">
          <p className="font-medium">Generated by {BRAND.name}</p>
          <p className="mt-1">{new Date().toLocaleDateString()} — Custom amigurumi pattern</p>
        </div>
      </div>
    </div>
  );
}
