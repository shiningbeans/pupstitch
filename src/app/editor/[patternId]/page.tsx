'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePatternStore } from '@/store/pattern-store';
import PatternEditor from '@/components/editor/PatternEditor';
import { CustomPattern } from '@/types';
import { generatePatternPDF } from '@/lib/export/pdf-generator';
import { generateProductSpecPDF } from '@/lib/export/product-spec-pdf';
import { BRAND } from '@/lib/brand';
import PreviewPicker from '@/components/products/PreviewPicker';

export default function EditorPage() {
  const params = useParams();
  const patternId = params.patternId as string;

  const currentPattern = usePatternStore((s) => s.currentPattern);
  const isGeneratingPreview = usePatternStore((s) => s.isGeneratingPreview);
  const leashBuddySpec = usePatternStore((s) => s.leashBuddySpec);
  const isGeneratingProductPreview = usePatternStore((s) => s.isGeneratingProductPreview);
  const productPreviewUrl = usePatternStore((s) => s.productPreviewUrl);
  const productPreviewOptions = usePatternStore((s) => s.productPreviewOptions);
  const selectedPreviewIndex = usePatternStore((s) => s.selectedPreviewIndex);
  const selectProductPreview = usePatternStore((s) => s.selectProductPreview);
  const scenicPhotos = usePatternStore((s) => s.scenicPhotos);
  const isGeneratingScenicPhotos = usePatternStore((s) => s.isGeneratingScenicPhotos);
  const generateScenicPhotos = usePatternStore((s) => s.generateScenicPhotos);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [activeTab, setActiveTab] = useState<'product' | 'pattern'>('product');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const loadAttempted = useRef(false);

  const pattern: CustomPattern | null =
    currentPattern && currentPattern.id === patternId ? currentPattern : null;

  useEffect(() => {
    if (pattern || loadAttempted.current) return;
    loadAttempted.current = true;
    (async () => {
      try {
        const store = usePatternStore.getState();
        await store.initStorage();
        await store.loadPattern(patternId);
        const after = usePatternStore.getState();
        if (!after.currentPattern || after.currentPattern.id !== patternId) {
          setLoadFailed(true);
        }
      } catch {
        setLoadFailed(true);
      }
    })();
  }, [pattern, patternId]);

  useEffect(() => {
    if (pattern && loadFailed) setLoadFailed(false);
  }, [pattern, loadFailed]);

  const handleDownloadPDF = async (type: 'product' | 'crochet') => {
    if (!pattern) return;
    setIsDownloading(true);
    try {
      const spec = leashBuddySpec || pattern.leashBuddySpec;
      if (type === 'product' && spec) {
        await generateProductSpecPDF(spec);
      } else {
        await generatePatternPDF(pattern);
      }
    } catch (err) {
      console.error('PDF generation failed:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to generate PDF: ${msg}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCheckout = async (product: 'leashbuddy' | 'bundle' | 'crochet') => {
    if (!pattern) return;
    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          patternId: pattern.id,
          dogName: pattern.dogName || '',
          breedId: pattern.breedId || '',
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Checkout is not available yet. Check back soon!');
      }
    } catch {
      alert('Unable to start checkout. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const spec = leashBuddySpec || pattern?.leashBuddySpec;
  const hasLeashBuddy = !!spec;
  const breedDisplay = pattern
    ? pattern.breedId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '';
  const dogName = pattern?.dogName || '';
  const productName = dogName
    ? `${dogName}'s ${BRAND.catalog.leashBuddy.name}`
    : `${breedDisplay} ${BRAND.catalog.leashBuddy.name}`;

  // Determine the hero preview image
  const heroImage =
    productPreviewUrl ||
    spec?.previewImageUrl ||
    (productPreviewOptions.length > 0 ? productPreviewOptions[0] : null) ||
    pattern?.previewImageUrl ||
    null;

  if (pattern) {
    return (
      <div className="min-h-screen bg-brand-cream">
        {/* Minimal top bar */}
        <div className="print:hidden sticky top-0 z-40 bg-brand-cream/90 backdrop-blur-lg border-b border-stone-200/60">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Designer
            </Link>
            <Link href="/" className="text-lg font-bold tracking-tight text-stone-900">
              {BRAND.name}
            </Link>
            <div className="w-24" />
          </div>
        </div>

        {/* Hero section — product preview + info */}
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-12 print:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: Product image */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden shadow-sm">
                <div className="relative aspect-square flex items-center justify-center bg-gradient-to-br from-stone-50 to-brand-cream-dark">
                  {isGeneratingProductPreview ? (
                    <div className="flex flex-col items-center gap-4">
                      <svg className="w-10 h-10 text-brand-coral animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="text-stone-500 text-sm">Creating your design...</p>
                      <div className="w-32 h-1 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-coral animate-pulse rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>
                  ) : productPreviewOptions.length >= 2 ? (
                    <PreviewPicker
                      options={productPreviewOptions}
                      selectedIndex={selectedPreviewIndex}
                      onSelect={selectProductPreview}
                    />
                  ) : heroImage ? (
                    <img
                      src={heroImage}
                      alt={productName}
                      className="w-full h-full object-contain p-6 cursor-pointer"
                      onClick={() => setLightboxImage(heroImage)}
                    />
                  ) : isGeneratingPreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-8 h-8 text-brand-coral animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="text-stone-400 text-sm">Generating preview...</p>
                    </div>
                  ) : pattern.dogPhotoUrl ? (
                    <img
                      src={pattern.dogPhotoUrl}
                      alt={`Reference for ${pattern.name}`}
                      className="max-w-full max-h-full rounded-lg object-contain p-8"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-stone-300">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                      <p className="text-sm text-stone-400">Preview coming soon</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reference photo thumbnail */}
              {pattern.dogPhotoUrl && heroImage && (
                <div className="flex items-center gap-3">
                  <img
                    src={pattern.dogPhotoUrl}
                    alt="Your dog"
                    className="w-16 h-16 rounded-lg object-cover border-2 border-stone-200"
                  />
                  <p className="text-xs text-stone-400">Your reference photo</p>
                </div>
              )}
            </div>

            {/* Right: Product details */}
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-brand-coral uppercase tracking-wider mb-2">
                  Made for {dogName || 'your pup'}
                </p>
                <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-stone-900 leading-tight">
                  {hasLeashBuddy ? productName : pattern.name}
                </h1>
                <p className="text-stone-500 mt-3">
                  {hasLeashBuddy
                    ? BRAND.catalog.leashBuddy.tagline
                    : 'Custom crochet amigurumi pattern'}
                </p>
              </div>

              {/* Pricing */}
              {hasLeashBuddy && (
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-stone-900">
                      ${BRAND.catalog.leashBuddy.price}
                    </span>
                    <span className="text-sm text-stone-400">USD</span>
                  </div>

                  {/* Bundle upsell */}
                  <div className="bg-brand-coral-soft rounded-xl p-4 border border-brand-coral/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-stone-900">
                          {BRAND.catalog.bundle.name} — ${BRAND.catalog.bundle.price}
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {BRAND.catalog.bundle.includes?.join(' + ')}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-brand-coral bg-white px-2 py-1 rounded-full">
                        Save ${BRAND.catalog.leashBuddy.price + 30 - BRAND.catalog.bundle.price}
                      </span>
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => handleCheckout('leashbuddy')}
                      disabled={isCheckingOut}
                      className="w-full btn-primary py-3.5 text-base font-semibold disabled:opacity-50"
                    >
                      {isCheckingOut ? 'Redirecting...' : `Order ${BRAND.catalog.leashBuddy.name} — $${BRAND.catalog.leashBuddy.price}`}
                    </button>
                    <button
                      onClick={() => handleCheckout('bundle')}
                      disabled={isCheckingOut}
                      className="w-full btn-secondary py-3 text-sm disabled:opacity-50"
                    >
                      {isCheckingOut ? 'Redirecting...' : `Get ${BRAND.catalog.bundle.name} — $${BRAND.catalog.bundle.price}`}
                    </button>
                  </div>

                  {/* Crochet PDF add-on */}
                  <p className="text-xs text-stone-400 text-center">
                    Includes free crochet pattern PDF (${BRAND.catalog.crochetPdf.price} value)
                  </p>
                </div>
              )}

              {/* Product specs pills */}
              {spec && (
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 rounded-full text-xs text-stone-600 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    {spec.dimensions.heightCm}&times;{spec.dimensions.widthCm}&times;{spec.dimensions.depthCm}cm
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 bg-stone-100 rounded-full text-xs text-stone-600 font-medium capitalize">
                    {spec.earStyle} ears
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 bg-stone-100 rounded-full text-xs text-stone-600 font-medium">
                    Handcrafted
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 bg-stone-100 rounded-full text-xs text-stone-600 font-medium">
                    Leash-attachable
                  </span>
                </div>
              )}

              {/* Standalone crochet pattern (no LeashBuddy) */}
              {!hasLeashBuddy && (
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-stone-900">
                      ${BRAND.catalog.crochetPdf.price}
                    </span>
                    <span className="text-sm text-stone-400">Crochet Pattern PDF</span>
                  </div>
                  <button
                    onClick={() => handleDownloadPDF('crochet')}
                    disabled={isDownloading}
                    className="w-full btn-primary py-3.5 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Pattern — ${BRAND.catalog.crochetPdf.price}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Back to customize */}
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Tweak colors & customize
              </Link>
            </div>
          </div>
        </div>

        {/* Scenic Photos Gallery */}
        <div className="bg-white border-y border-stone-200/60 print:hidden">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-editorial font-bold text-stone-900">
                {dogName || 'Your Pup'} in the Wild
              </h2>
              <p className="text-stone-500 mt-2 text-sm">
                See your custom crochet amigurumi styled in beautiful scenes
              </p>
            </div>

            {scenicPhotos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {scenicPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxImage(photo)}
                    className="group relative overflow-hidden rounded-xl border border-stone-200/60 bg-stone-50 aspect-[4/3]"
                  >
                    <img
                      src={photo}
                      alt={`${dogName || breedDisplay} scenic photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : isGeneratingScenicPhotos ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <svg className="w-8 h-8 text-brand-coral animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-stone-500 text-sm">Creating 3 scenic photos... this takes about 30 seconds</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={() => generateScenicPhotos()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-coral-soft text-brand-coral font-semibold hover:bg-brand-coral hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Generate Scenic Photos
                </button>
                <p className="text-xs text-stone-400 mt-2">3 AI-generated scenes featuring your crochet amigurumi</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs: Product view / Crochet Pattern */}
        {hasLeashBuddy && (
          <div className="max-w-6xl mx-auto px-4 pt-8 print:hidden">
            <div className="flex gap-1 bg-stone-100 p-1 rounded-xl max-w-md mx-auto">
              <button
                onClick={() => setActiveTab('product')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'product'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                Product Details
              </button>
              <button
                onClick={() => setActiveTab('pattern')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'pattern'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                Crochet Pattern
              </button>
            </div>
          </div>
        )}

        {/* Tab content */}
        {activeTab === 'product' && hasLeashBuddy ? (
          <div className="max-w-6xl mx-auto px-4 py-8 print:hidden">
            {/* What's included */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 border border-stone-200/60">
                <div className="w-10 h-10 rounded-full bg-brand-coral-soft flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-brand-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-stone-900 mb-1">Custom Made</h3>
                <p className="text-sm text-stone-500">
                  Handcrafted to match {dogName || 'your dog'}&apos;s unique colors and features
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-stone-200/60">
                <div className="w-10 h-10 rounded-full bg-brand-coral-soft flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-brand-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-stone-900 mb-1">Clips to Any Leash</h3>
                <p className="text-sm text-stone-500">
                  Built-in carabiner attaches to your leash, harness, or bag in seconds
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-stone-200/60">
                <div className="w-10 h-10 rounded-full bg-brand-coral-soft flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-brand-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-stone-900 mb-1">Free Pattern Included</h3>
                <p className="text-sm text-stone-500">
                  Every order includes the crochet pattern PDF so you can make your own
                </p>
              </div>
            </div>

            {/* Color palette display */}
            {spec && spec.fabricColors.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-stone-200/60 mb-8">
                <h3 className="font-semibold text-stone-900 mb-4">Your Color Palette</h3>
                <div className="flex flex-wrap gap-3">
                  {spec.fabricColors.map((fabric, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: fabric.hex }}
                      />
                      <span className="text-sm text-stone-600">{fabric.partLabel}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download spec PDF (subtle) */}
            <div className="text-center">
              <button
                onClick={() => handleDownloadPDF('product')}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isDownloading ? 'Generating...' : 'Download full spec sheet (PDF)'}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Amigurumi preview for pattern tab */}
            {!hasLeashBuddy && isGeneratingPreview && (
              <div className="flex flex-col items-center justify-center py-12 mb-6">
                <svg className="w-8 h-8 text-brand-coral animate-spin mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-stone-500 text-sm">Generating amigurumi preview...</p>
              </div>
            )}
            <PatternEditor pattern={pattern} />
          </div>
        )}

        {/* Lightbox */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              onClick={() => setLightboxImage(null)}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={lightboxImage}
              alt="Full size preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="text-center max-w-md">
          <svg className="w-12 h-12 text-stone-300 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Pattern Not Found</h2>
          <p className="text-stone-500 mb-6">The pattern you are looking for could not be loaded.</p>
          <Link href="/upload" className="btn-primary inline-block">Create a New Pattern</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      <div className="text-center">
        <svg className="w-10 h-10 text-brand-coral animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <h2 className="text-xl font-bold text-stone-900">Loading your design</h2>
      </div>
    </div>
  );
}
