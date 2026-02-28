"use client";

import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 gradient-hero">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--primary)] mesh-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[var(--secondary)] mesh-blob-delay" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full bg-[var(--highlight)] mesh-blob-slow" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-stone-900 mb-6 tracking-tight text-balance leading-[1.1]">
            {BRAND.tagline}
          </h1>
        </div>

        <div className="animate-fade-in-delay">
          <p className="text-lg md:text-xl text-stone-500 mb-10 max-w-2xl mx-auto text-balance">
            Upload a photo of your dog and get AI-generated custom accessories — manufacturing-ready product specs, 3D previews, and crochet patterns.
          </p>
        </div>

        <div className="animate-fade-in-delay-2 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/upload" className="btn-primary text-base px-8 py-4">
            Get Started
          </Link>
          <a href="#how-it-works" className="btn-ghost text-base">
            See How It Works
          </a>
        </div>

        <div className="animate-fade-in-delay-2 mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-stone-400">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Custom to Your Dog
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            AI Color Matching
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Manufacturing-Ready
          </span>
        </div>
      </div>
    </section>
  );
}
