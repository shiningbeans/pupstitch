"use client";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: "📸",
      title: "Upload Your Dog's Photo",
      description:
        "Choose any clear photo of your beloved pup. A headshot works best, but we can work with full-body photos too!",
    },
    {
      number: 2,
      icon: "✨",
      title: "AI Customizes Your Pattern",
      description:
        "Our AI analyzes your dog's unique features—color, markings, and personality—to create a personalized crochet pattern.",
    },
    {
      number: 3,
      icon: "🧶",
      title: "Get Your Crochet Pattern",
      description:
        "Download your custom pattern instantly. Includes yarn color recommendations, stitches, and step-by-step instructions.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">
          Three simple steps to transform your dog into an adorable amigurumi pattern
        </p>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Card */}
              <div className="card p-8 h-full">
                {/* Step Number */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="step-number">{step.number}</div>
                  <span className="text-5xl">{step.icon}</span>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-warm-primary mb-4">
                  {step.title}
                </h3>
                <p className="text-warm-secondary text-lg leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector Arrow (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-6 top-1/3 transform -translate-y-1/2">
                  <svg
                    className="w-12 h-12 text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 5l7 7m0 0l-7 7m7-7H6"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-xl text-warm-secondary mb-6">
            Ready to create? Let&apos;s begin your crochet adventure!
          </p>
          <a href="#" className="btn-primary inline-block">
            Start Creating Now →
          </a>
        </div>
      </div>
    </section>
  );
}
