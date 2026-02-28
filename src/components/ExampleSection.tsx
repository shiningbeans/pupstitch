"use client";

const features = [
  {
    title: "AI-Powered Customization",
    description: "Colors, markings, and features tailored to your specific dog",
  },
  {
    title: "Complete Specifications",
    description: "Manufacturing-ready product specs with material and color details",
  },
  {
    title: "Instant Results",
    description: "Get your custom design in minutes, no waiting or complicated process",
  },
  {
    title: "Multiple Products",
    description: "Choose a poop bag holder, crochet pattern, or both",
  },
];

export default function ExampleSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6 tracking-tight">
              From Photo to Product in Minutes
            </h2>
            <p className="text-lg text-stone-500 mb-8 leading-relaxed">
              Upload a photo of your dog and receive a fully customized product design — complete with color matching, material specs, and 3D preview.
            </p>

            <div className="space-y-5 mb-10">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-stone-900 text-sm">{feature.title}</h3>
                    <p className="text-stone-500 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-8 py-6 border-y border-stone-100">
              <div className="text-center">
                <div className="text-3xl font-bold text-stone-900">5 min</div>
                <p className="text-xs text-stone-400 mt-1">Average time</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-stone-900">100%</div>
                <p className="text-xs text-stone-400 mt-1">Custom</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-stone-900">Instant</div>
                <p className="text-xs text-stone-400 mt-1">Download</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="glass p-8 w-full max-w-md">
              <div className="flex items-center justify-between mb-8">
                <div className="text-center flex-1">
                  <div className="w-20 h-20 rounded-2xl bg-stone-100 mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-10 h-10 text-stone-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-stone-600">Your Photo</p>
                </div>
                <svg className="w-6 h-6 text-stone-300 mx-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="text-center flex-1">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-10 h-10 text-[var(--primary)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-stone-600">Custom Product</p>
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-4">
                <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">Preview</p>
                <pre className="text-xs text-stone-500 font-mono leading-relaxed">
{`Material: Canvas (600D)
Body: #D4A574
Ears: Floppy, Felt
Binding: #8B6F47
Size: 4" × 3" × 1.5"`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
