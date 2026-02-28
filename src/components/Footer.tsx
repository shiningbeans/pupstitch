import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          <div>
            <span className="text-lg font-bold text-white tracking-tight">{BRAND.name}</span>
            <p className="text-sm mt-1.5 max-w-xs text-stone-500">{BRAND.tagline}</p>
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="/#products" className="hover:text-white transition-colors">Shop</Link>
            <Link href="/upload" className="hover:text-white transition-colors">Design Yours</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">My Creations</Link>
          </div>
        </div>
        <div className="border-t border-stone-800 pt-6 text-sm text-stone-600">
          &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
