"use client";

const breeds = [
  "Labrador Retriever",
  "German Shepherd",
  "Golden Retriever",
  "French Bulldog",
  "Bulldog",
  "Poodle",
  "Beagle",
  "Rottweiler",
  "Dachshund",
  "Corgi",
];

export default function SupportedBreeds() {
  return (
    <section className="py-20 md:py-28 bg-stone-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Popular Breeds</h2>
        <p className="section-subtitle">
          Optimized presets for these breeds, plus full support for any dog
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {breeds.map((breed) => (
            <div key={breed} className="breed-card">
              <span className="text-sm font-semibold text-stone-700">{breed}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 glass-solid p-6 max-w-xl mx-auto text-center">
          <p className="text-sm text-stone-500">
            <span className="font-semibold text-stone-700">Any breed works.</span>{" "}
            Our AI creates custom designs for every dog — upload your photo for a personalized result.
          </p>
        </div>
      </div>
    </section>
  );
}
