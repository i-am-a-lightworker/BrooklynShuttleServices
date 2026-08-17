import type { Config } from "tailwindcss";

// Brand palette from the Visual & Chart Branding Guidelines doc — reused
// here rather than a one-off theme, since it's already a documented,
// governed system (burgundy/navy/charcoal/cream/beige/gold).
const GOLD = "#B08D57";

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
        // gold is intentionally NOT here. It only exists as textColor/
        // borderColor/ringColor below, so bg-gold and fill-gold simply
        // aren't generated utilities — enforcing "callout accent only,
        // never a fill" at the config level, not just by convention.
      },
      textColor: { gold: GOLD },
      borderColor: { gold: GOLD },
      ringColor: { gold: GOLD },
      fontFamily: {
        // Cormorant Garamond = display/headline role; Inter = body/UI/data,
        // per the chart typography hierarchy. No script fonts on UI text.
        // Variables are set by next/font/google in app/layout.tsx.
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
      },
    },
  },
  plugins: [],
};
export default config;
