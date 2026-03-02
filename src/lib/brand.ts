/**
 * Brand configuration — single source of truth.
 * Change the name here and it updates everywhere.
 */
export const BRAND = {
  name: 'LeashBuddy',
  tagline: 'Custom gear that looks like your dog.',
  description:
    'Upload a photo of your dog and get AI-generated custom accessories — product specs, 3D previews, and crochet patterns.',
  keywords: [
    'custom dog accessories',
    'poop bag holder',
    'treat pouch',
    'custom pet products',
    'AI pet gear',
    'dog accessories',
    'crochet amigurumi',
  ],
  product: {
    pouch: 'Pouch',       // The poop bag holder product
    stitch: 'Stitch',     // The crochet pattern product
  },
  productType: {
    pouch: 'leash-buddy' as const,
    stitch: 'pupstitch' as const,
    both: 'both' as const,
  },
  catalog: {
    leashBuddy: {
      name: 'LeashBuddy',
      tagline: 'A poop bag holder that looks like your pup',
      price: 70,
      currency: 'USD',
    },
    bundle: {
      name: 'The Full Set',
      tagline: 'LeashBuddy + matching leash & collar',
      price: 100,
      currency: 'USD',
      includes: ['LeashBuddy', 'Matching Leash', 'Matching Collar'],
    },
    crochetPdf: {
      name: 'Crochet Pattern',
      tagline: 'Make your own amigurumi',
      price: 2,
      currency: 'USD',
      freeWithLeashBuddy: true,
    },
    scenicPhotos: {
      name: 'Scenic Photos',
      tagline: 'Your dog as a crochet model in beautiful scenes',
      includedWith: 'all',
    },
  },
};
