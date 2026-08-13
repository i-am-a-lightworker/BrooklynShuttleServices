"use client";

import { useState } from "react";
import { FARES } from "@/lib/product-config";
import { bandForHour, expectedWaitMinutes } from "@/lib/frequency";

function formatHour(hour: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour < 12 ? "AM" : "PM";
  return `${h}:00 ${suffix}`;
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);

export default function FrequencyCalculator({ flash = false }: { flash?: boolean }) {
  const [hour, setHour] = useState(8);
  const band = bandForHour(hour);
  const wait = expectedWaitMinutes(hour);

  return (
    <div
      className={`rounded-sm border border-beige bg-cream p-6 transition-shadow duration-500 ${
        flash ? "ring-2 ring-gold" : ""
      }`}
    >
      <h2 className="font-display text-xl font-semibold text-navy">
        What time are you riding?
      </h2>
      <p className="mt-1 text-sm text-charcoal/60">
        Price never changes. Frequency does.
      </p>

      <label className="mt-6 block text-sm text-charcoal/70">
        Time of day
        <input
          type="range"
          min={0}
          max={23}
          step={1}
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          className="mt-2 w-full accent-burgundy"
        />
      </label>
      <div className="mt-1 flex justify-between text-[10px] text-charcoal/40">
        <span>12 AM</span>
        <span>12 PM</span>
        <span>11 PM</span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-charcoal/50">
            Departing
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-navy">
            {formatHour(hour)}
          </p>
          <p className="text-xs text-charcoal/50">{band.label}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-charcoal/50">
            Expected wait
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-burgundy">
            ~{wait} min
          </p>
          <p className="text-xs text-charcoal/50">
            every {band.headwayMinutes} min
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-charcoal/50">
            Fare — fixed
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-navy">
            ${FARES.singleRide.price.toFixed(2)}
          </p>
          <p className="text-xs text-charcoal/50">same at every hour</p>
        </div>
      </div>
    </div>
  );
}
