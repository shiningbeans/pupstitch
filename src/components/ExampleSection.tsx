"use client";

export default function ExampleSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Testimonial/Example Text */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-warm-primary mb-6">
              From Photo to Pattern in Minutes
            </h2>
            <p className="text-lg text-warm-secondary mb-6 leading-relaxed">
              Imagine holding a custom crochet pattern that captures the essence of your
              beloved pup. That&apos;s the PupStitch experience.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">✅</span>
                <div>
                  <h3 className="font-bold text-warm-primary mb-1">AI-Powered Customization</h3>
                  <p className="text-warm-secondary">
                    Unique colors, markings, and features tailored to your specific dog
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">✅</span>
                <div>
                  <h3 className="font-bold text-warm-primary mb-1">Complete Instructions</h3>
                  <p className="text-warm-secondary">
                    Step-by-step guide with yarn recommendations and all stitch details
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">✅</span>
                <div>
                  <h3 className="font-bold text-warm-primary mb-1">Instant Download</h3>
                  <p className="text-warm-secondary">
                    Get your pattern instantly. No waiting, no complicated ordering process
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">✅</span>
                <div>
                  <h3 className="font-bold text-warm-primary mb-1">Perfect Gift Idea</h3>
                  <p className="text-warm-secondary">
                    Share the pattern with friends or keep it as a keepsake for yourself
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-8 border-y border-amber-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">5 min</div>
                <p className="text-sm text-warm-secondary">Average time</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">🎯</div>
                <p className="text-sm text-warm-secondary">100% custom</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">📥</div>
                <p className="text-sm text-warm-secondary">Instant DL</p>
              </div>
            </div>
          </div>

          {/* Right: Decorative Illustration Area */}
          <div className="flex items-center justify-center">
            <div className="relative w-full">
              {/* Decorative Cards showing before/after */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-200 shadow-lg">
                <div className="text-center">
                  <div className="flex justify-around mb-8">
                    <div className="text-center">
                      <div className="text-7xl mb-4">🐕</div>
                      <p className="font-bold text-warm-primary">Your Dog&apos;s Photo</p>
                    </div>
                    <div className="flex items-center justify-center text-4xl text-amber-500">
                      →
                    </div>
                    <div className="text-center">
                      <div className="text-7xl mb-4">🧶</div>
                      <p className="font-bold text-warm-primary">Your Pattern</p>
                    </div>
                  </div>

                  {/* Pattern Preview */}
                  <div className="mt-8 bg-white rounded-lg p-6 border border-amber-100 text-left">
                    <h3 className="font-bold text-warm-primary mb-3">Pattern Preview</h3>
                    <pre className="text-xs text-warm-secondary font-mono bg-amber-50 p-3 rounded overflow-auto max-h-40">
{`Materials:
- Yarn (Amber #D97706)
- Yarn (Cream #FEF3C7)
- Crochet Hook Size 4mm

Abbreviations:
SC = Single Crochet
INC = Increase
DEC = Decrease

Head: 6sc in magic ring
Round 2: Inc in each st (12)
Round 3: sc 1, inc, repeat (18)
...`}
                    </pre>
                  </div>

                  <p className="mt-6 text-sm text-warm-secondary italic">
                    ✨ Fully customized for your pup&apos;s unique look
                  </p>
                </div>
              </div>

              {/* Floating Elements for Visual Interest */}
              <div className="absolute top-0 right-0 text-5xl opacity-50 animate-pulse">
                🧵
              </div>
              <div className="absolute bottom-0 left-0 text-5xl opacity-50 animate-pulse animation-delay-1000">
                🪡
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
