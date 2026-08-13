"use client";

import { useState } from "react";
import ShuttleMap from "@/components/ShuttleMap";
import { ROUTE } from "@/lib/product-config";

export default function RouteAndMap() {
  const [hoveredSegment, setHoveredSegment] = useState<"a" | "b" | "both" | null>(null);

  return (
    <>
      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {ROUTE.shuttles.map((leg) => {
          // The hub sits at the junction of both segments, not specifically
          // on the Canarsie side — hovering it highlights both.
          const segment = leg.id === "shuttle-2" ? "b" : leg.id === "hub" ? "both" : "a";

          return (
            <div
              key={leg.id}
              className={`rounded-sm border p-5 ${
                leg.id === "hub"
                  ? "border-gold/60 bg-cream"
                  : "border-beige bg-cream"
              }`}
              onMouseEnter={() => setHoveredSegment(segment)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-charcoal/50">
                {leg.evidenceTier === "concurrent" && "Same-study evidence"}
                {leg.evidenceTier === "bridge" && "Bridging evidence"}
                {leg.evidenceTier === "directional" && "Directional evidence"}
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-navy">
                {leg.label}
              </h2>
              <p className="text-sm text-charcoal/70">
                {leg.from} → {leg.to}
              </p>
              <p className="mt-2 text-xs text-charcoal/50">{leg.note}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-16">
        <h2 className="mb-3 font-display text-2xl font-semibold text-navy">
          Live tracking
        </h2>
        <ShuttleMap hoveredSegment={hoveredSegment} />
      </section>
    </>
  );
}
