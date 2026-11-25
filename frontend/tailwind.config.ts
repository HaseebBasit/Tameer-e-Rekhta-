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
        rekhta: {
          navy: "#17243A",
          navyDark: "#0F172A",
          burgundy: "#800F35",
          burgundyDark: "#600B27",
          gold: "#D7A84B",
          goldMuted: "#B8860B",
          bg: "#F8F9FA",
          text: "#1E293B",
          card: "#FFFFFF",
          border: "#E2E8F0",
          muted: "#64748B",
          accent: "#991B1B",
          goldLight: "#FDF8ED",
          burgundyLight: "#FDF2F4",
          navyLight: "#F1F5F9",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "'Plus Jakarta Sans'", "sans-serif"],
        heading: ["var(--font-outfit)", "'Plus Jakarta Sans'", "sans-serif"],
        urdu: ["var(--font-urdu)", "'Noto Nastaliq Urdu'", "'Jameel Noori Nastaleeq'", "Amiri", "serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(20, 48, 34, 0.08)",
        cardHover: "0 12px 30px -4px rgba(20, 48, 34, 0.14)",
        glow: "0 0 25px rgba(79, 143, 58, 0.25)",
        rekhta: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        rekhtaMd: "0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)",
        rekhtaLg: "0 10px 25px -3px rgba(15, 23, 42, 0.09), 0 4px 6px -2px rgba(15, 23, 42, 0.04)",
      },
      aspectRatio: {
        "4/3": "4 / 3",
        "16/9": "16 / 9",
        "16/10": "16 / 10",
      },
    },
  },
  plugins: [],
};
export default config;
