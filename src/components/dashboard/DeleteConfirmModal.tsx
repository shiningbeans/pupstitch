'use client';

import { useEffect } from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  patternName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  patternName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-amber-100 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-amber-100 bg-gradient-to-r from-red-50 to-orange-50">
            <h2 className="text-lg font-bold text-warm-primary">
              Delete &quot;{patternName}&quot;?
            </h2>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <p className="text-warm-secondary text-center">
              This action cannot be undone. Your pattern and all associated data
              will be permanently deleted.
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-amber-100 flex gap-3 bg-secondary-cream-light rounded-b-xl">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-white text-warm-primary font-semibold rounded-lg border-2 border-amber-200 hover:bg-amber-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
