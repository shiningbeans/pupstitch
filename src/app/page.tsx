"use client";

import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import SupportedBreeds from "@/components/SupportedBreeds";
import ExampleSection from "@/components/ExampleSection";
import { BRAND } from "@/lib/brand";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <HowItWorks />
      <SupportedBreeds />
      <ExampleSection />

      {/* Final CTA */}
      <section className="py-20 md:py-28 gradient-cta">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight text-balance">
            Ready to Create Your Custom {BRAND.product.pouch}?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
            Upload a photo of your dog and get a custom product designed just for them.
          </p>
          <Link href="/upload" className="inline-block px-8 py-4 bg-white text-slate-900 font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
