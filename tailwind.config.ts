import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "background-warm": "var(--background-warm)",
        "text-warm": "var(--text-warm)",
        "text-dark": "var(--text-dark)",
        "primary-amber": "var(--primary-amber)",
        "primary-amber-light": "var(--primary-amber-light)",
        "secondary-cream": "var(--secondary-cream)",
        "secondary-cream-light": "var(--secondary-cream-light)",
        "accent-coral": "var(--accent-coral)",
      },
      fontFamily: {
        inter: ["var(--font-inter)"],
      },
    },
  },
  plugins: [],
};
export default config;
