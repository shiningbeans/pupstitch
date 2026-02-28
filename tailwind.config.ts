import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        editorial: ["Georgia", "Times New Roman", "serif"],
      },
      colors: {
        brand: {
          coral: '#E8533F',
          'coral-dark': '#D4432F',
          'coral-soft': '#FEF0ED',
          sand: '#C4956A',
          'sand-soft': '#F5EDE4',
          charcoal: '#2D2926',
          cream: '#FAF8F5',
          'cream-dark': '#F3EFEA',
        },
      },
    },
  },
  plugins: [],
};
export default config;
