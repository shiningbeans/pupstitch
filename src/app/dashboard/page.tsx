'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePatternStore } from '@/store/pattern-store';
import PatternCard from '@/components/dashboard/PatternCard';
import { BRAND } from '@/lib/brand';

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

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-3">My Creations</h1>
          <p className="text-lg text-slate-500">Your saved {BRAND.product.pouch} specs and {BRAND.product.stitch} patterns</p>
        </div>

        {!isLoading && savedPatterns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <svg className="w-16 h-16 text-slate-200 mb-6" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 text-center">No creations yet</h2>
            <p className="text-slate-500 text-lg mb-8 text-center max-w-md">Upload a photo of your dog to create your first custom product.</p>
            <Link href="/upload" className="btn-primary text-base px-8 py-4">Get Started</Link>
          </div>
        )}

        {!isLoading && savedPatterns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPatterns.map((pattern) => (
              <PatternCard key={pattern.id} pattern={pattern} onDelete={deletePattern} />
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <svg className="w-8 h-8 text-[var(--primary)] animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-slate-500">Loading your creations</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
