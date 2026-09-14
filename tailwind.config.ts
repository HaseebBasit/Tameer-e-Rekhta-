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
        brand: {
          dark: "#0f271a",
          forest: "#143022",
          moss: "#1b3a2b",
          green: "#2e7d32",
          emerald: "#4F8F3A",
          leaf: "#5B9B45",
          lime: "#6AA84F",
          mint: "#e8f5e9",
          cream: "#FAF8F5",
          sand: "#F5F2EB",
          charcoal: "#151515",
          pitch: "#111111",
          gold: "#d4af37",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-outfit)", "sans-serif"],
        urdu: ["var(--font-urdu)", "Amiri", "Noto Nastaliq Urdu", "serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(20, 48, 34, 0.08)",
        cardHover: "0 12px 30px -4px rgba(20, 48, 34, 0.14)",
        glow: "0 0 25px rgba(79, 143, 58, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
