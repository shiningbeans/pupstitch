'use client';

import { useEffect } from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  patternName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ isOpen, patternName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onCancel(); };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-solid max-w-sm w-full shadow-xl">
          <div className="px-6 py-5 border-b border-stone-100">
            <h2 className="text-lg font-bold text-stone-900">Delete &ldquo;{patternName}&rdquo;?</h2>
          </div>
          <div className="px-6 py-6">
            <p className="text-stone-500 text-center text-sm">This action cannot be undone. Your pattern and all associated data will be permanently deleted.</p>
          </div>
          <div className="px-6 py-4 border-t border-stone-100 flex gap-3">
            <button onClick={onCancel} className="flex-1 btn-secondary text-sm">Cancel</button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-all duration-200 text-sm">Delete</button>
          </div>
        </div>
      </div>
    </>
  );
}
