"use client";

import { useMemo } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { buildHourlyDemand, WAYPOINTS, isAmHour, isPmHour } from "@/lib/demand-data";
import { DEMAND_PROFILE } from "@/lib/product-config";

const LINE_COLORS = ["#5E0000", "#0D1028", "#B08D57", "#3A6B5E"];

function formatHour(hour: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}${hour < 12 ? "a" : "p"}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: number;
}) {
  if (!active || !payload || label === undefined) return null;
  const window = isAmHour(label) ? "AM" : isPmHour(label) ? "PM" : null;

  return (
    <div className="rounded-sm border border-beige bg-cream p-3 text-xs shadow-sm">
      <p className="font-semibold text-navy">
        {formatHour(label)}
        {window && (
          <span className="ml-2 text-charcoal/50">{window} window</span>
        )}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="mt-1">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export default function DemandChart() {
  const data = useMemo(() => buildHourlyDemand(), []);

  return (
    <div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD3" />
            <XAxis
              dataKey="hour"
              tickFormatter={formatHour}
              interval={2}
              tick={{ fontSize: 11, fill: "#0D1028aa" }}
              axisLine={{ stroke: "#E5DFD3" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#0D1028aa" }}
              axisLine={{ stroke: "#E5DFD3" }}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {WAYPOINTS.map((waypoint, i) => (
              <Line
                key={waypoint}
                type="monotone"
                dataKey={waypoint}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-charcoal/50">
        Modeled from the measured ranges — PM rush ({DEMAND_PROFILE.pmRushWindow})
        runs {DEMAND_PROFILE.pmOverAmRange}, with a {DEMAND_PROFILE.peakPlateauWindow}{" "}
        plateau. Hover to compare any stop&apos;s AM vs. PM volume. Full
        per-minute traffic counts live in the ops dashboard.
      </p>
    </div>
  );
}
