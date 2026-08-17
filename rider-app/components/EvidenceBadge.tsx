import type { WaypointEvidence } from "@/lib/evidence-data";
import { pmOverAmPct } from "@/lib/evidence-data";
import Disclosure from "@/components/Disclosure";

// These Tailwind classes intentionally match EVIDENCE_TIER_COLOR in lib/brand.ts; update both together.
// concurrent/bridge text colors reuse the brand's navy/burgundy tokens directly,
// since those are literally the PM hex for those two tiers in the chart.
const TIER_STYLES: Record<
  WaypointEvidence["tier"],
  { bg: string; text: string; label: string }
> = {
  concurrent: { bg: "bg-sky-100", text: "text-navy", label: "Concurrent" },
  bridge: { bg: "bg-pink-100", text: "text-burgundy", label: "Bridge" },
  directional: { bg: "bg-gray-200", text: "text-gray-700", label: "Directional" },
  anomaly: { bg: "bg-charcoal", text: "text-cream", label: "Anomaly" },
};

export default function EvidenceBadge({
  waypoint,
}: {
  waypoint: WaypointEvidence;
}) {
  const style = TIER_STYLES[waypoint.tier];

  return (
    <Disclosure
      trigger={
        <>
          {waypoint.label} · {style.label}
        </>
      }
      triggerClassName={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.bg} ${style.text} hover:opacity-80`}
    >
      <div className="mt-2 max-w-xs rounded-sm border border-beige bg-cream p-3 text-xs text-charcoal/80">
        <p className="font-semibold text-navy">{waypoint.label}</p>
        <p className="mt-1">AM volume: {waypoint.am.toLocaleString()}</p>
        <p>PM volume: {waypoint.pm.toLocaleString()}</p>
        <p className="mt-1 text-charcoal/50">
          {pmOverAmPct(waypoint) >= 0 ? "+" : ""}
          {pmOverAmPct(waypoint)}% PM vs AM · {waypoint.era}
        </p>
      </div>
    </Disclosure>
  );
}
