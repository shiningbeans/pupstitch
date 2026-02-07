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
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG or PNG)');
      return;
    }

    // Read file as data URL
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
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-amber-500 bg-amber-50 scale-105'
              : 'border-amber-200 bg-amber-50/50 hover:border-amber-400 hover:bg-amber-50'
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

          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl animate-bounce">🐾</div>
            <div>
              <h3 className="text-2xl font-bold text-amber-900 mb-2">
                Upload Your Pup
              </h3>
              <p className="text-amber-700 mb-2">
                Drag and drop your dog&apos;s photo here
              </p>
              <p className="text-sm text-amber-600">
                or click to browse (JPEG or PNG)
              </p>
            </div>
            <div className="flex gap-2 text-4xl pt-4">
              <span>📸</span>
              <span>🐕</span>
              <span>✨</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border-2 border-amber-200 bg-white shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Uploaded dog photo"
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <button
              onClick={handleRemove}
              className="absolute top-4 right-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
              aria-label="Remove image"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={handleBrowseClick}
            className="w-full btn-secondary text-amber-700 hover:bg-amber-50"
          >
            Choose Different Photo
          </button>
        </div>
      )}
    </div>
  );
}
