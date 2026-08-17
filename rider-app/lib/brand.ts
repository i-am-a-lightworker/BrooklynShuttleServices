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
//
// Each tier gets a light (AM) / dark (PM) pair rather than one hue at two
// opacities — concurrent and bridge deliberately reuse BRAND.navy/burgundy
// so the chart ties back to the site's actual identity colors. Anomaly is
// pure black/white on purpose: it's the one tier that doesn't fit the
// pattern, and the chart says so visually too.
export const EVIDENCE_TIER_COLOR: Record<EvidenceTier, { am: string; pm: string }> = {
  concurrent: { am: "#7DD3FC", pm: BRAND.navy }, // light blue / navy
  bridge: { am: "#F9A8D4", pm: BRAND.burgundy }, // pink / maroon
  directional: { am: "#D1D5DB", pm: "#6B7280" }, // unchanged gray family
  anomaly: { am: "#FFFFFF", pm: "#000000" }, // black & white
};
