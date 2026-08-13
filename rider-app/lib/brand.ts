export const BRAND = {
  burgundy: "#5E0000",
  navy: "#0D1028",
  charcoal: "#24221F",
  cream: "#F6F3EE",
  beige: "#D9D3CB",
  gold: "#B08D57",
} as const;

// Intentional secondary status palette for evidence tiers, separate from brand identity colors above, not a brand-system violation.
export const EVIDENCE_TIER_COLOR = {
  concurrent: "#16a34a",
  bridge: "#d97706",
  directional: "#6b7280",
  anomaly: "#e11d48",
} as const;
