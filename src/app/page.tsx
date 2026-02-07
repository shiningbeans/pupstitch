"use client";

import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import SupportedBreeds from "@/components/SupportedBreeds";
import ExampleSection from "@/components/ExampleSection";

export default function Home() {
  return (
    <div className="bg-background-warm">
      {/* Hero Section */}
      <HeroSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Supported Breeds Section */}
      <SupportedBreeds />

      {/* Example/Testimonial Section */}
      <ExampleSection />

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 gradient-sunset">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
            Ready to Create Your Dog&apos;s Pattern?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Your adorable amigurumi is just one upload away. Let&apos;s get started!
          </p>
          <Link href="/upload" className="btn-primary text-lg inline-block">
            Upload Your Dog&apos;s Photo →
          </Link>
        </div>
      </section>
    </div>
  );
}
