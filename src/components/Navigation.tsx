"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 hover:text-[var(--primary)] transition-colors">
            {BRAND.name}
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Home
            </Link>
            <Link href="/upload" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Create
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/upload" className="btn-small">
              Get Started
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <Link href="/" className="block py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link href="/upload" className="block py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors" onClick={() => setIsOpen(false)}>
              Create
            </Link>
            <Link href="/dashboard" className="block py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors" onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
            <Link href="/upload" className="block mt-3 btn-small text-center" onClick={() => setIsOpen(false)}>
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
