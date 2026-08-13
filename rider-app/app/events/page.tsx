"use client";

import { FARES } from "@/lib/product-config";

async function startCheckout() {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fareKey: "eventBundle" }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">
        Event service
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy">
        Barclays Center events
      </h1>
      <p className="mt-2 max-w-xl text-charcoal/70">
        Atlantic Terminal is the busiest point on our entire corridor —
        roughly double any other stop. Skip the post-event subway crush.
      </p>

      <div className="mt-10 max-w-sm rounded-sm border border-gold/50 bg-cream p-6">
        <h2 className="text-[10px] font-semibold uppercase tracking-wide text-charcoal/50">
          Event round trip
        </h2>
        <p className="mt-2 font-display text-4xl font-semibold text-burgundy">
          ${FARES.eventBundle.price.toFixed(2)}
        </p>
        <p className="mt-2 text-sm text-charcoal/60">
          Direct, nonstop pickup at Atlantic Terminal after the event.
        </p>
        <button
          onClick={startCheckout}
          className="mt-6 rounded-sm bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy-light"
        >
          Buy — test mode
        </button>
      </div>

      <p className="mt-10 max-w-xl text-xs text-charcoal/50">
        Integration note: production version bundles this at Ticketmaster/AXS
        checkout via venue partnership, rather than a standalone purchase.
      </p>
    </div>
  );
}
