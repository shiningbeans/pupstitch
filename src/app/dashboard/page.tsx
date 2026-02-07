'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePatternStore } from '@/store/pattern-store';
import PatternCard from '@/components/dashboard/PatternCard';

export default function DashboardPage() {
  const { savedPatterns, loadAllSaved, deletePattern } = usePatternStore();
  const [isLoading, setIsLoading] = useState(true);

  const initStorage = usePatternStore((s) => s.initStorage);

  useEffect(() => {
    const init = async () => {
      await initStorage();
      await loadAllSaved();
      setIsLoading(false);
    };
    init();
  }, [initStorage, loadAllSaved]);

  const handleDeletePattern = (id: string) => {
    deletePattern(id);
  };

  return (
    <div className="min-h-screen bg-background-warm py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="section-title text-4xl md:text-5xl mb-2">My Patterns</h1>
          <p className="section-subtitle text-lg md:text-xl text-warm-secondary">
            Your saved amigurumi creations
          </p>
        </div>

        {/* Empty State */}
        {!isLoading && savedPatterns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="text-6xl mb-6">🧶</div>
            <h2 className="text-2xl font-bold text-warm-primary mb-3 text-center">
              No patterns yet!
            </h2>
            <p className="text-warm-secondary text-lg mb-8 text-center max-w-md">
              Upload a photo to get started and create your first amigurumi pattern.
            </p>
            <Link href="/upload" className="btn-primary text-lg px-8 py-4">
              Upload Your First Pattern →
            </Link>
          </div>
        )}

        {/* Patterns Grid */}
        {!isLoading && savedPatterns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {savedPatterns.map((pattern) => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                onDelete={handleDeletePattern}
              />
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin text-4xl mb-4">🧶</div>
              <p className="text-warm-secondary">Loading your patterns...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
