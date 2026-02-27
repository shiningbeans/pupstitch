'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CustomPattern } from '@/types';
import DeleteConfirmModal from './DeleteConfirmModal';

interface PatternCardProps {
  pattern: CustomPattern;
  onDelete: (id: string) => void;
}

export default function PatternCard({ pattern, onDelete }: PatternCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getBodyPartCount = () => pattern.generatedPattern.sections.reduce((total, section) => total + section.bodyParts.length, 0);

  const stars = { beginner: 1, intermediate: 2, advanced: 3 }[pattern.generatedPattern.skillLevel] || 1;
  const estimatedHours = Math.round(pattern.generatedPattern.estimatedTotalTime);
  const bodyPartCount = getBodyPartCount();

  return (
    <>
      <div className="glass-solid group overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-300">
        <div className="relative h-48 overflow-hidden bg-slate-50">
          {pattern.dogPhotoThumbnailUrl || pattern.dogPhotoUrl ? (
            <Image src={pattern.dogPhotoThumbnailUrl || pattern.dogPhotoUrl} alt={pattern.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>
          )}
          {pattern.productType && pattern.productType !== 'pupstitch' && (
            <div className="absolute top-3 left-3 bg-[var(--primary)] text-white rounded-full px-2.5 py-0.5 text-xs font-bold shadow-sm">
              {pattern.productType === 'both' ? 'Both' : 'Pouch'}
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-slate-700 border border-slate-100 shadow-sm">
            {pattern.analysisResult.detectedBreed.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </div>
        </div>

        <div className="p-5 flex flex-col">
          <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-2">{pattern.name}</h3>
          <p className="text-xs text-slate-400 mb-4">Created {formatDate(pattern.createdAt)}</p>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <svg key={i} className={`w-3.5 h-3.5 ${i < stars ? 'text-[var(--highlight)]' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-slate-400 capitalize">{pattern.generatedPattern.skillLevel}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5 py-3 px-3 bg-slate-50 rounded-lg">
            <div className="text-center">
              <div className="text-xl font-bold text-slate-900">{estimatedHours}</div>
              <div className="text-xs text-slate-400">{estimatedHours === 1 ? 'Hour' : 'Hours'}</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-slate-900">{bodyPartCount}</div>
              <div className="text-xs text-slate-400">{bodyPartCount === 1 ? 'Part' : 'Parts'}</div>
            </div>
          </div>

          <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
            <Link href={`/editor/${pattern.id}`} className="flex-1 btn-small text-center text-sm">Edit</Link>
            <button onClick={() => setIsDeleteModalOpen(true)} className="flex-1 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-full hover:bg-red-100 transition-all duration-200 text-sm border border-red-100">
              Delete
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmModal isOpen={isDeleteModalOpen} patternName={pattern.name} onConfirm={() => { setIsDeleteModalOpen(false); onDelete(pattern.id); }} onCancel={() => setIsDeleteModalOpen(false)} />
    </>
  );
}
