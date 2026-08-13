"use client";

import { useState } from "react";
import type { WaypointEvidence } from "@/lib/evidence-data";
import { pmOverAmPct } from "@/lib/evidence-data";

// These Tailwind classes intentionally match EVIDENCE_TIER_COLOR in lib/brand.ts; update both together.
const TIER_STYLES: Record<
  WaypointEvidence["tier"],
  { bg: string; text: string; label: string }
> = {
  concurrent: { bg: "bg-green-100", text: "text-green-800", label: "Concurrent" },
  bridge: { bg: "bg-amber-100", text: "text-amber-800", label: "Bridge" },
  directional: { bg: "bg-gray-200", text: "text-gray-700", label: "Directional" },
  anomaly: { bg: "bg-rose-100", text: "text-rose-800", label: "Anomaly" },
};

export default function EvidenceBadge({
  waypoint,
}: {
  waypoint: WaypointEvidence;
}) {
  const [open, setOpen] = useState(false);
  const style = TIER_STYLES[waypoint.tier];

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.bg} ${style.text} hover:opacity-80`}
      >
        {waypoint.label} · {style.label}
      </button>
      {open && (
        <div className="mt-2 max-w-xs rounded-sm border border-beige bg-cream p-3 text-xs text-charcoal/80">
          <p className="font-semibold text-navy">{waypoint.label}</p>
          <p className="mt-1">AM volume: {waypoint.am.toLocaleString()}</p>
          <p>PM volume: {waypoint.pm.toLocaleString()}</p>
          <p className="mt-1 text-charcoal/50">
            {pmOverAmPct(waypoint) >= 0 ? "+" : ""}
            {pmOverAmPct(waypoint)}% PM vs AM · {waypoint.era}
          </p>
        </div>
      )}
    </div>
  );
}
