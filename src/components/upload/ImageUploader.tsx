'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface ImageUploaderProps {
  onImagesSelected: (files: File[], dataUrls: string[]) => void;
  selectedImages?: string[];
  maxPhotos?: number;
}

export default function ImageUploader({
  onImagesSelected,
  selectedImages = [],
  maxPhotos = 3,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (newFiles: FileList | File[]) => {
    const validFiles: File[] = [];
    const validDataUrls: string[] = [];

    const filesToProcess = Array.from(newFiles).slice(0, maxPhotos - selectedImages.length);

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      validFiles.push(file);
      validDataUrls.push(dataUrl);
    }

    if (validFiles.length > 0) {
      // Merge with existing images — we pass ALL data urls (existing + new)
      // The parent manages the full array via the store
      onImagesSelected(validFiles, [...selectedImages, ...validDataUrls]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) handleFiles(files);
    // Reset so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleRemove = (index: number) => {
    const updated = selectedImages.filter((_, i) => i !== index);
    onImagesSelected([], updated);
  };

  const canAddMore = selectedImages.length < maxPhotos;

  return (
    <div className="w-full space-y-3">
      {/* Thumbnails of uploaded images */}
      {selectedImages.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {selectedImages.map((img, idx) => (
            <div key={idx} className="relative rounded-xl overflow-hidden border border-stone-200 bg-white shadow-sm group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Dog photo ${idx + 1}`} className="w-full aspect-square object-cover" />
              <button
                onClick={() => handleRemove(idx)}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-white text-stone-600 rounded-full p-1.5 transition-all duration-200 shadow-sm hover:shadow opacity-0 group-hover:opacity-100"
                aria-label={`Remove photo ${idx + 1}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/50 text-white text-xs font-medium rounded-md">
                {idx + 1}/{selectedImages.length}
              </div>
            </div>
          ))}

          {/* Add more button (if room) */}
          {canAddMore && (
            <button
              onClick={handleBrowseClick}
              className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/50 hover:border-stone-300 hover:bg-stone-50 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-6 h-6 text-stone-300 mb-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs text-stone-400 font-medium">Add Photo</span>
            </button>
          )}
        </div>
      )}

      {/* Drop zone (shown when no images yet) */}
      {selectedImages.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.02]'
              : 'border-stone-200 bg-stone-50/50 hover:border-stone-300 hover:bg-stone-50'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <svg className="w-10 h-10 text-stone-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <div>
              <h3 className="text-base font-semibold text-stone-700 mb-1">Upload Your Dog&apos;s Photos</h3>
              <p className="text-sm text-stone-400">Drag and drop or click to browse</p>
              <p className="text-xs text-stone-300 mt-1">JPEG or PNG &middot; Up to {maxPhotos} photos for best results</p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input (supports multiple) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Upload dog photos"
      />

      {/* Hint text */}
      {selectedImages.length > 0 && selectedImages.length < maxPhotos && (
        <p className="text-xs text-stone-400 text-center">
          Multiple angles help the AI capture your dog&apos;s colors and markings more accurately
        </p>
      )}
    </div>
  );
}
