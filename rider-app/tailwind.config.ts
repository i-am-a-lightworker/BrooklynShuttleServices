import type { Config } from "tailwindcss";

// Brand palette from the Visual & Chart Branding Guidelines doc — reused
// here rather than a one-off theme, since it's already a documented,
// governed system (burgundy/navy/charcoal/cream/beige/gold).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: "#5E0000", // primary accent — CTAs, key highlights, active states
          light: "#7A2020",
        },
        navy: {
          DEFAULT: "#0D1028", // secondary accent — structural badges, headers
          light: "#1C2040",
        },
        charcoal: "#24221F", // all body copy, labels, axis values
        cream: "#F6F3EE", // canvas/card background
        beige: "#D9D3CB", // borders, gridlines, dividers
        gold: "#B08D57", // subtle callout badges/icons only — never a fill
      },
      fontFamily: {
        // Cormorant Garamond = display/headline role; Inter = body/UI/data,
        // per the chart typography hierarchy. No script fonts on UI text.
        // Variables are set by next/font/google in app/layout.tsx.
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
