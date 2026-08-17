import type { EvidenceTier } from "./evidence-data";

export const BRAND = {
  burgundy: "#5E0000",
  navy: "#0D1028",
  charcoal: "#24221F",
  cream: "#F6F3EE",
  beige: "#D9D3CB",
  gold: "#B08D57",
} as const;

// Intentional secondary status palette for evidence tiers, separate from
// brand identity colors above, not a brand-system violation. Typed against
// EvidenceTier so adding/renaming a tier is a compile error here (and, since
// EvidenceBadge.tsx's TIER_STYLES is separately typed the same way, there
// too) rather than a silently-missed color.
export const EVIDENCE_TIER_COLOR: Record<EvidenceTier, string> = {
  concurrent: "#16a34a",
  bridge: "#d97706",
  directional: "#6b7280",
  anomaly: "#e11d48",
};
