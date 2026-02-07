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

export default function PatternCard({
  pattern,
  onDelete,
}: PatternCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false);
    onDelete(pattern.id);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  // Format date nicely (e.g., "Feb 7, 2026")
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get number of body parts in the pattern
  const getBodyPartCount = () => {
    return pattern.generatedPattern.sections.reduce((total, section) => {
      return total + section.bodyParts.length;
    }, 0);
  };

  // Get difficulty level as star count (1-3 stars)
  const getDifficultyStars = () => {
    const skillMap = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
    };
    return skillMap[pattern.generatedPattern.skillLevel] || 1;
  };

  const stars = getDifficultyStars();
  const difficultyLabel = pattern.generatedPattern.skillLevel;
  const estimatedHours = Math.round(
    pattern.generatedPattern.estimatedTotalTime
  );
  const bodyPartCount = getBodyPartCount();

  return (
    <>
      <div className="card-hover group overflow-hidden">
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden bg-gradient-honey">
          {pattern.dogPhotoThumbnailUrl || pattern.dogPhotoUrl ? (
            <Image
              src={pattern.dogPhotoThumbnailUrl || pattern.dogPhotoUrl}
              alt={pattern.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🐕
            </div>
          )}
          {/* Breed Badge */}
          <div className="absolute top-3 right-3 bg-white bg-opacity-95 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-warm-primary border border-amber-100 shadow-sm">
            {pattern.analysisResult.detectedBreed
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5 flex flex-col h-full">
          {/* Pattern Name */}
          <h3 className="text-lg font-bold text-warm-primary mb-2 line-clamp-2">
            {pattern.name}
          </h3>

          {/* Created Date */}
          <p className="text-sm text-warm-secondary mb-4">
            Created {formatDate(pattern.createdAt)}
          </p>

          {/* Difficulty Stars */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={i < stars ? 'text-amber-400' : 'text-gray-300'}>
                  ⭐
                </span>
              ))}
            </div>
            <span className="text-xs text-warm-secondary capitalize">
              {difficultyLabel}
            </span>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5 py-4 px-3 bg-secondary-cream-light rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-warm-primary">
                {estimatedHours}
              </div>
              <div className="text-xs text-warm-secondary">
                {estimatedHours === 1 ? 'Hour' : 'Hours'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warm-primary">
                {bodyPartCount}
              </div>
              <div className="text-xs text-warm-secondary">
                {bodyPartCount === 1 ? 'Part' : 'Parts'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-auto pt-4 border-t border-amber-100">
            <Link
              href={`/editor/${pattern.id}`}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-500 transition-all duration-200 text-center text-sm shadow-sm hover:shadow-md"
            >
              Edit
            </Link>
            <button
              onClick={handleDeleteClick}
              className="flex-1 px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-all duration-200 text-sm border border-red-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        patternName={pattern.name}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
