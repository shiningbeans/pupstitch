export default function Footer() {
  return (
    <footer className="bg-white border-t-2 border-amber-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🐾</span>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                PupStitch
              </span>
            </div>
            <p className="text-sm text-amber-700">
              Transform your dog&apos;s photo into a beautiful crochet pattern
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-amber-900 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-amber-700">
              <li>
                <a href="/" className="hover:text-amber-900 transition">
                  Home
                </a>
              </li>
              <li>
                <a href="/upload" className="hover:text-amber-900 transition">
                  Upload Photo
                </a>
              </li>
              <li>
                <a href="/dashboard" className="hover:text-amber-900 transition">
                  My Patterns
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-amber-900 mb-3">About</h3>
            <p className="text-sm text-amber-700">
              Created with love for dog lovers and crochet enthusiasts
            </p>
          </div>
        </div>

        <div className="border-t border-amber-100 pt-6 text-center text-sm text-amber-700">
          <p>
            &copy; 2024 PupStitch. All rights reserved. Made with
            <span className="text-rose-500"> ❤️ </span>
            and<span className="text-amber-500"> 🧶</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
