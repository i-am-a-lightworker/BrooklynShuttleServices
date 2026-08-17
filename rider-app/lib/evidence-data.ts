export type EvidenceTier = "concurrent" | "bridge" | "directional" | "anomaly";

export type WaypointEvidence = {
  id: string;
  label: string;
  am: number;
  pm: number;
  tier: EvidenceTier;
  era: string;
};

// Every number here traces to the NYC DOT Automated Traffic Volume Counts
// analysis from this project's research phase (see ops-dashboard/traffic.duckdb).
// `tier` reflects how directly comparable a point is to the others:
//   concurrent  — same field study, same ~2-week window
//   bridge      — different study, still corridor-adjacent
//   directional — different years, used for direction/shape, not magnitude
//   anomaly     — included on purpose, not hidden — doesn't fit the PM-lean pattern
export const WAYPOINT_EVIDENCE: WaypointEvidence[] = [
  {
    id: "remsen-canarsie",
    label: "Remsen Ave (Canarsie)",
    am: 14724,
    pm: 24197,
    tier: "concurrent",
    era: "Jul 2010",
  },
  {
    id: "utica-empire",
    label: "Utica Ave @ Empire Blvd",
    am: 4586,
    pm: 8468,
    tier: "concurrent",
    era: "Jul 2010",
  },
  {
    id: "washington-eastern",
    label: "Washington Ave @ Eastern Pkwy",
    am: 7431,
    pm: 14744,
    tier: "bridge",
    era: "May 2010",
  },
  {
    id: "nostrand-clifton",
    label: "Nostrand Ave @ Clifton Pl",
    am: 8478,
    pm: 18718,
    tier: "bridge",
    era: "Dec 2024",
  },
  {
    id: "atlantic-terminal",
    label: "Atlantic Terminal",
    am: 42126,
    pm: 69659,
    tier: "directional",
    era: "2020",
  },
  {
    id: "court-st",
    label: "Court St",
    am: 5046,
    pm: 10062,
    tier: "directional",
    era: "2025",
  },
  // Included on purpose — doesn't fit the PM-lean pattern, and that's part of
  // the credibility, not a reason to drop it. Era wasn't supplied alongside
  // this figure; flag it before citing this point externally.
  {
    id: "franklin-ave",
    label: "Franklin Ave",
    am: 1663,
    pm: 1294,
    tier: "anomaly",
    era: "era unverified",
  },
];

export function pmOverAmPct(w: WaypointEvidence): number {
  if (w.am === 0) return 0;
  return Math.round(((w.pm - w.am) / w.am) * 100);
}
