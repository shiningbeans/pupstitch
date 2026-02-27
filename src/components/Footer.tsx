import { BRAND } from "@/lib/brand";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
          <div>
            <span className="text-lg font-bold text-white tracking-tight">{BRAND.name}</span>
            <p className="text-sm mt-1 max-w-xs">{BRAND.tagline}</p>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/upload" className="hover:text-white transition-colors">Create</a>
            <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 text-sm text-slate-500">
          &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
