"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  WAYPOINT_EVIDENCE,
  pmOverAmPct,
  type WaypointEvidence,
} from "@/lib/evidence-data";
import { BRAND, EVIDENCE_TIER_COLOR } from "@/lib/brand";
import EvidenceBadge from "./EvidenceBadge";

const TIER_COLOR: Record<WaypointEvidence["tier"], string> = EVIDENCE_TIER_COLOR;

function shortLabel(label: string): string {
  return label.length > 16 ? label.slice(0, 15) + "…" : label;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: WaypointEvidence }[];
}) {
  if (!active || !payload || !payload[0]) return null;
  const w = payload[0].payload;
  return (
    <div className="rounded-sm border border-beige bg-cream p-3 text-xs shadow-sm">
      <p className="font-semibold text-navy">{w.label}</p>
      <p className="mt-1 text-charcoal/70">AM: {w.am.toLocaleString()}</p>
      <p className="text-charcoal/70">PM: {w.pm.toLocaleString()}</p>
      <p className="mt-1 text-charcoal/50">
        {pmOverAmPct(w) >= 0 ? "+" : ""}
        {pmOverAmPct(w)}% PM vs AM · {w.era}
      </p>
    </div>
  );
}

export default function EvidenceChart() {
  const data = WAYPOINT_EVIDENCE.map((w) => ({ ...w, name: shortLabel(w.label) }));

  return (
    <div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={BRAND.beige} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#0D1028aa" }}
              axisLine={{ stroke: BRAND.beige }}
              tickLine={false}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#0D1028aa" }}
              axisLine={{ stroke: BRAND.beige }}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="am" name="AM" fillOpacity={0.45}>
              {data.map((w) => (
                <Cell key={`am-${w.id}`} fill={TIER_COLOR[w.tier]} />
              ))}
            </Bar>
            <Bar dataKey="pm" name="PM">
              {data.map((w) => (
                <Cell key={`pm-${w.id}`} fill={TIER_COLOR[w.tier]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-[10px] uppercase tracking-wide text-charcoal/40">
        Lighter bar = AM · solid bar = PM · color = evidence tier
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {WAYPOINT_EVIDENCE.map((w) => (
          <EvidenceBadge key={w.id} waypoint={w} />
        ))}
      </div>
    </div>
  );
}
