'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface ImageUploaderProps {
  onImageSelected: (file: File, dataUrl: string) => void;
  selectedImage?: string;
}

export default function ImageUploader({
  onImageSelected,
  selectedImage,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG or PNG)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onImageSelected(file, dataUrl);
    };
    reader.readAsDataURL(file);
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
    const files = e.dataTransfer.files;
    if (files && files.length > 0) handleFile(files[0]);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) handleFile(files[0]);
  };

  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageSelected(new File([], ''), '');
  };

  return (
    <div className="w-full">
      {!selectedImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.02]'
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Upload dog photo"
          />
          <div className="flex flex-col items-center gap-3">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <div>
              <h3 className="text-base font-semibold text-slate-700 mb-1">Upload Your Dog&apos;s Photo</h3>
              <p className="text-sm text-slate-400">Drag and drop or click to browse</p>
              <p className="text-xs text-slate-300 mt-1">JPEG or PNG</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedImage} alt="Uploaded dog photo" className="w-full h-80 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            <button
              onClick={handleRemove}
              className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-600 rounded-full p-2 transition-all duration-200 shadow-sm hover:shadow"
              aria-label="Remove image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button onClick={handleBrowseClick} className="w-full btn-secondary text-sm">
            Choose Different Photo
          </button>
        </div>
      )}
    </div>
  );
}
