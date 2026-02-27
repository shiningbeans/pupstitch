/**
 * Brand configuration — single source of truth.
 * Change the name here and it updates everywhere.
 */
export const BRAND = {
  name: 'LIKKIT',
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
};
