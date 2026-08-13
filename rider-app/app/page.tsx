import { ROUTE, FARES, BENCHMARKS, DEMAND_PROFILE, BRAND_NAME } from "@/lib/product-config";
import ShuttleMap from "@/components/ShuttleMap";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">
        {BRAND_NAME} · independent shuttle service
      </p>
      <h1 className="mt-2 max-w-2xl font-display text-5xl font-semibold leading-tight text-navy">
        Canarsie to Court St, on the corridor that already carries the
        traffic to prove it.
      </h1>
      <p className="mt-4 max-w-xl text-charcoal/70">
        Built around real NYC DOT traffic counts and priced under a subway
        swipe.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href="/pricing"
          className="rounded-sm bg-burgundy px-6 py-3 text-sm font-semibold text-cream hover:bg-burgundy-light"
        >
          See fares — from ${FARES.singleRide.price.toFixed(2)}
        </a>
        <a
          href="/employers"
          className="rounded-sm border border-navy px-6 py-3 text-sm font-semibold text-navy hover:bg-navy hover:text-cream"
        >
          Employer passes
        </a>
      </div>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {ROUTE.shuttles.map((leg) => (
          <div
            key={leg.id}
            className={`rounded-sm border p-5 ${
              leg.id === "hub"
                ? "border-gold/60 bg-cream"
                : "border-beige bg-cream"
            }`}
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
        ))}
      </section>

      <section className="mt-16">
        <h2 className="mb-3 font-display text-2xl font-semibold text-navy">
          Live tracking
        </h2>
        <ShuttleMap />
      </section>

      <section className="mt-16 rounded-sm border-l-2 border-burgundy bg-cream py-6 pl-8">
        <h2 className="font-display text-2xl font-semibold text-navy">
          Why the schedule leans PM
        </h2>
        <p className="mt-2 max-w-2xl text-charcoal/70">
          PM rush ({DEMAND_PROFILE.pmRushWindow}) runs{" "}
          {DEMAND_PROFILE.pmOverAmRange} at every waypoint we measured.
          Shuttles run more frequently through the{" "}
          {DEMAND_PROFILE.peakPlateauWindow} plateau — the fare stays the
          same, the wait gets shorter.
        </p>
      </section>

      <section className="mt-16 flex flex-wrap items-baseline gap-10 border-t border-beige pt-8 text-sm text-charcoal/60">
        <div>
          <span className="font-display text-3xl font-semibold text-burgundy">
            ${FARES.singleRide.price.toFixed(2)}
          </span>{" "}
          our single ride
        </div>
        <div>
          <span className="font-display text-3xl font-semibold text-charcoal/30">
            ${BENCHMARKS.subwayFare.toFixed(2)}
          </span>{" "}
          subway swipe
        </div>
        <div>
          <span className="font-display text-3xl font-semibold text-charcoal/30">
            ${BENCHMARKS.dollarVanFare.toFixed(2)}
          </span>{" "}
          dollar van
        </div>
      </section>
    </div>
  );
}
