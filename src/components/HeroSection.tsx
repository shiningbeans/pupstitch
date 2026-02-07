"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="min-h-screen gradient-honey flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Decorative Icon */}
        <div className="mb-6 text-7xl md:text-8xl animate-bounce">🧶</div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-warm-primary mb-6 text-balance leading-tight">
          Turn Your Dog Into a Crochet Pattern
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-warm-secondary mb-4 text-balance">
          Create a custom amigurumi pattern from your pup&apos;s photo
        </p>
        <p className="text-lg text-warm-secondary mb-12 text-balance max-w-2xl mx-auto">
          Upload a photo, let AI work its magic, and get your unique crochet pattern in minutes. The perfect handmade gift for dog lovers everywhere.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/upload" className="btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl">
            Upload Your Dog&apos;s Photo →
          </Link>
          <a
            href="#how-it-works"
            className="btn-secondary text-lg px-8 py-4"
          >
            Learn How It Works
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-12 border-t-2 border-amber-200">
          <p className="text-warm-secondary font-medium mb-6">
            Trusted by crochet enthusiasts worldwide ✨
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-warm-secondary">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>Instant Patterns</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💙</span>
              <span>Dog-Lovers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✋</span>
              <span>Handcrafted Results</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
