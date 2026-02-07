"use client";

export default function SupportedBreeds() {
  const breeds = [
    { name: "Labrador", emoji: "🦮" },
    { name: "German Shepherd", emoji: "🐕" },
    { name: "Golden Retriever", emoji: "🐕" },
    { name: "French Bulldog", emoji: "🐶" },
    { name: "Bulldog", emoji: "🐕" },
    { name: "Poodle", emoji: "🐩" },
    { name: "Beagle", emoji: "🐕" },
    { name: "Rottweiler", emoji: "🐕" },
    { name: "Dachshund", emoji: "🐕" },
    { name: "Corgi", emoji: "🐕" },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Supported Breeds</h2>
        <p className="section-subtitle">
          We have preset patterns optimized for these popular dog breeds
        </p>

        {/* Breeds Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {breeds.map((breed, index) => (
            <div
              key={index}
              className="breed-card group hover:scale-110 hover:shadow-xl hover:bg-gradient-to-br hover:from-amber-50 hover:to-yellow-50 transition-all duration-300"
            >
              <div className="text-5xl mb-3 group-hover:scale-125 transition-transform duration-300">
                {breed.emoji}
              </div>
              <h3 className="font-bold text-warm-primary text-center">
                {breed.name}
              </h3>
            </div>
          ))}
        </div>

        {/* Note about custom breeds */}
        <div className="mt-12 bg-white card p-6 md:p-8 max-w-2xl mx-auto">
          <p className="text-center text-warm-secondary">
            <span className="font-semibold text-warm-primary">💡 Tip:</span> Don&apos;t
            see your breed? No problem! Our AI can create custom patterns for any
            dog. Upload your pup&apos;s photo for a personalized pattern.
          </p>
        </div>
      </div>
    </section>
  );
}
