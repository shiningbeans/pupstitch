'use client';

import { CustomPattern, ColorAssignment } from '@/types';
import { useState } from 'react';

interface ColorPanelProps {
  pattern: CustomPattern;
  onColorChange: (colorKey: string, newColor: string) => void;
  onAddColor: (colorKey: string, hexCode: string, yarnName: string) => void;
  onBodyPartColorChange: (partName: string, hexCode: string) => void;
}

const QUICK_COLORS = [
  { name: 'Black', hex: '#0F0F0F' }, { name: 'White', hex: '#FAFAFA' },
  { name: 'Slate Gray', hex: '#475569' }, { name: 'Slate Blue', hex: '#64748B' },
  { name: 'Stone Gray', hex: '#78716C' }, { name: 'Warm Gray', hex: '#A8A29E' },
  { name: 'Light Slate', hex: '#CBD5E1' }, { name: 'Silver', hex: '#E2E8F0' },
  { name: 'Charcoal', hex: '#1E293B' }, { name: 'Dark Slate', hex: '#334155' },
  { name: 'Graphite', hex: '#2D3748' }, { name: 'Ash', hex: '#9CA3AF' },
  { name: 'Cream', hex: '#FFFBF0' }, { name: 'Ivory', hex: '#FEFDF9' },
  { name: 'Taupe', hex: '#8B8680' }, { name: 'Dove', hex: '#A9A9A9' },
];

const BODY_PART_LABELS: Record<string, string> = {
  head: 'Head', body: 'Body', ears: 'Ears', legs: 'Legs',
  tail: 'Tail', snout: 'Snout / Muzzle', nose: 'Nose',
};

export default function ColorPanel({ pattern, onColorChange, onAddColor, onBodyPartColorChange }: ColorPanelProps) {
  const [showAddColor, setShowAddColor] = useState(false);
  const [newColorHex, setNewColorHex] = useState('#475569');
  const [newColorName, setNewColorName] = useState('');
  const [expandedPart, setExpandedPart] = useState<string | null>(null);

  const bodyParts = pattern.analysisResult?.bodyPartAnalysis ?? [];
  const colorAssignments = pattern.customizations.colorAssignments;

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const key = newColorName.toLowerCase().replace(/\s+/g, '-');
    onAddColor(key, newColorHex, newColorName.trim());
    setShowAddColor(false);
    setNewColorName('');
    setNewColorHex('#475569');
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-widest letter-spacing-2">Yarn Palette</h3>
          <p className="text-xs text-slate-500 mt-1.5">Detected colors from your photo. Adjust any swatch to customize.</p>
        </div>
        
        <div className="space-y-2.5">
          {colorAssignments.map((assignment: ColorAssignment) => (
            <div key={assignment.colorKey} className="group relative backdrop-blur-sm bg-white/40 border border-white/60 rounded-xl p-3 transition-all hover:bg-white/60 hover:border-white/80">
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={assignment.hexCode} 
                  onChange={(e) => onColorChange(assignment.colorKey, e.target.value)} 
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200/50 hover:border-slate-300 transition-colors flex-shrink-0 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{assignment.yarnName || assignment.colorKey}</p>
                  <p className="text-xs text-slate-400 font-mono tracking-tight">{assignment.hexCode}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!showAddColor ? (
          <button 
            onClick={() => setShowAddColor(true)} 
            className="mt-4 w-full py-2.5 px-4 text-sm font-medium text-slate-600 bg-white/30 border border-dashed border-slate-300/50 rounded-xl hover:bg-white/50 hover:border-slate-400/50 transition-all backdrop-blur-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Color
          </button>
        ) : (
          <div className="mt-4 p-4 backdrop-blur-md bg-white/50 border border-white/70 rounded-xl space-y-3.5">
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={newColorHex} 
                onChange={(e) => setNewColorHex(e.target.value)} 
                className="w-12 h-12 rounded-lg cursor-pointer border border-slate-200/50 shadow-sm"
              />
              <input 
                type="text" 
                value={newColorName} 
                onChange={(e) => setNewColorName(e.target.value)} 
                placeholder="Color name" 
                className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200/50 rounded-lg bg-white/50 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_COLORS.map((c) => (
                <button 
                  key={c.hex} 
                  onClick={() => { setNewColorHex(c.hex); setNewColorName(c.name); }} 
                  className="w-7 h-7 rounded-full border border-slate-200/50 hover:scale-110 hover:border-slate-400 transition-all shadow-sm hover:shadow-md" 
                  style={{ backgroundColor: c.hex }} 
                  title={c.name}
                />
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button 
                onClick={handleAddColor} 
                disabled={!newColorName.trim()} 
                className="flex-1 py-2 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
              <button 
                onClick={() => setShowAddColor(false)} 
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white/40 border border-white/60 rounded-lg hover:bg-white/60 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200/30" />

      <div>
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-widest">Body Part Colors</h3>
          <p className="text-xs text-slate-500 mt-1.5">Refine colors for each detected body part.</p>
        </div>

        {bodyParts.length > 0 ? (
          <div className="space-y-2.5">
            {bodyParts.map((bp) => {
              const label = BODY_PART_LABELS[bp.partName] || bp.partName;
              const isExpanded = expandedPart === bp.partName;
              return (
                <div key={bp.partName} className="rounded-xl border border-white/60 overflow-hidden backdrop-blur-sm bg-white/40 hover:bg-white/60 transition-all">
                  <div className="flex items-center gap-3 p-3.5">
                    <input 
                      type="color" 
                      value={bp.primaryColor || '#475569'} 
                      onChange={(e) => onBodyPartColorChange(bp.partName, e.target.value)} 
                      className="w-9 h-9 rounded-lg cursor-pointer border border-slate-200/50 hover:border-slate-300 transition-colors flex-shrink-0 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{label}</p>
                      <p className="text-xs text-slate-400 font-mono tracking-tight">{bp.primaryColor || '#475569'}</p>
                    </div>
                    {bp.colors && bp.colors.length > 1 && (
                      <button 
                        onClick={() => setExpandedPart(isExpanded ? null : bp.partName)} 
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100/50 rounded-lg transition-colors"
                      >
                        <div className="flex -space-x-1">
                          {bp.colors.slice(1, 4).map((c, i) => (
                            <div key={i} className="w-3.5 h-3.5 rounded-full border border-white/70 shadow-sm" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <span className="font-medium">+{bp.colors.length - 1}</span>
                      </button>
                    )}
                  </div>
                  {isExpanded && bp.colors && bp.colors.length > 1 && (
                    <div className="px-3.5 pb-3.5 bg-slate-50/40 border-t border-white/60">
                      <p className="text-xs text-slate-500 mt-2.5 mb-2 font-medium">Additional colors:</p>
                      <div className="flex flex-wrap gap-2">
                        {bp.colors.slice(1).map((c, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/40 border border-white/60 rounded-lg backdrop-blur-sm">
                            <div className="w-4 h-4 rounded-full border border-slate-200/50 shadow-sm" style={{ backgroundColor: c }} />
                            <span className="text-xs font-mono text-slate-600">{c}</span>
                          </div>
                        ))}
                      </div>
                      {bp.markings && bp.markings.length > 0 && (
                        <p className="text-xs text-slate-500 mt-2.5">Markings: {bp.markings.join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200/30">
            <p className="text-sm text-slate-500">No body part analysis. Upload a photo for detection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
