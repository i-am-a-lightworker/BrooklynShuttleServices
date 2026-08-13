"use client";

import { FARES } from "@/lib/product-config";
import FrequencyCalculator from "@/components/FrequencyCalculator";

const TIERS = [
  {
    key: "singleRide",
    ...FARES.singleRide,
    blurb: "One ride, any leg of the corridor.",
  },
  {
    key: "dayPass",
    ...FARES.dayPass,
    blurb: "Unlimited rides today, including hub transfers.",
  },
  {
    key: "tenRidePass",
    ...FARES.tenRidePass,
    blurb: "10 rides, no expiration. ~8% off single-ride price.",
  },
];

async function startCheckout(fareKey: string) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fareKey }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-navy">Fares</h1>
      <p className="mt-2 text-charcoal/70">
        Fixed prices. No surge. Same fare at 7am and 6pm — more shuttles run
        at peak instead.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.key}
            className="flex flex-col rounded-sm border border-beige bg-cream p-6"
          >
            <h2 className="text-[10px] font-semibold uppercase tracking-wide text-charcoal/50">
              {tier.label}
            </h2>
            <p className="mt-2 font-display text-4xl font-semibold text-burgundy">
              ${tier.price.toFixed(2)}
            </p>
            <p className="mt-2 flex-1 text-sm text-charcoal/60">
              {tier.blurb}
            </p>
            <button
              onClick={() => startCheckout(tier.key)}
              className="mt-6 rounded-sm bg-burgundy px-4 py-2 text-sm font-semibold text-cream hover:bg-burgundy-light"
            >
              Buy — test mode
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <FrequencyCalculator />
      </div>
    </div>
  );
}
