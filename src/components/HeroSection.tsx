"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="min-h-screen gradient-honey flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Decorative Icon */}
        <div className="mb-6 text-7xl md:text-8xl animate-bounce">🐕</div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-warm-primary mb-6 text-balance leading-tight">
          Custom Dog Accessories, Powered by AI
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-warm-secondary mb-4 text-balance">
          Upload a photo of your dog and get a custom LeashBuddy poop bag holder that looks just like them
        </p>
        <p className="text-lg text-warm-secondary mb-12 text-balance max-w-2xl mx-auto">
          Our AI analyzes your dog&apos;s breed, colors, and unique markings to create a personalized product spec and 3D preview. Plus, get a matching crochet pattern with PupStitch.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/upload" className="btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl">
            Create Your LeashBuddy
          </Link>
          <a
            href="#how-it-works"
            className="btn-secondary text-lg px-8 py-4"
          >
            How It Works
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-12 border-t-2 border-amber-200">
          <p className="text-warm-secondary font-medium mb-6">
            AI-powered custom pet accessories
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-warm-secondary">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <span>Custom to Your Dog</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              <span>AI Color Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📦</span>
              <span>Manufacturing-Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧶</span>
              <span>+ PupStitch Patterns</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
