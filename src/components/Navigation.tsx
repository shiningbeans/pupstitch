"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b-2 border-amber-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-3xl">🐾</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent group-hover:from-amber-700 group-hover:to-orange-600 transition-all">
              PupStitch
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-warm-secondary font-medium hover:text-amber-700 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/upload"
              className="text-warm-secondary font-medium hover:text-amber-700 transition-colors duration-200"
            >
              Upload
            </Link>
            <Link
              href="/dashboard"
              className="text-warm-secondary font-medium hover:text-amber-700 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              href="/upload"
              className="btn-primary text-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-amber-50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-amber-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t-2 border-amber-100">
            <Link
              href="/"
              className="block py-2 text-warm-secondary font-medium hover:text-amber-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/upload"
              className="block py-2 text-warm-secondary font-medium hover:text-amber-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Upload
            </Link>
            <Link
              href="/dashboard"
              className="block py-2 text-warm-secondary font-medium hover:text-amber-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/upload"
              className="block mt-3 btn-primary text-sm text-center"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
