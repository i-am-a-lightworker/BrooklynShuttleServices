import { ROUTE, FARES, BENCHMARKS, BRAND_NAME } from "@/lib/product-config";
import ShuttleMap from "@/components/ShuttleMap";
import EvidenceChart from "@/components/EvidenceChart";

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

      <section className="mt-16 rounded-sm border-l-2 border-burgundy bg-cream p-6 pl-8">
        <h2 className="font-display text-2xl font-semibold text-navy">
          Why the schedule leans PM
        </h2>
        <p className="mt-2 max-w-2xl text-charcoal/70">
          Shuttles run more frequently through the PM plateau — the fare
          stays the same, the wait gets shorter. Every bar below is a real
          count, color-coded by how directly comparable it is to the
          others — click a waypoint to see the raw numbers.
        </p>
        <div className="mt-6">
          <EvidenceChart />
        </div>
        <p className="mt-6 max-w-2xl text-xs text-charcoal/50">
          Built on NYC DOT Automated Traffic Volume Counts — a rotating
          survey, not continuous monitoring. Each point above is labeled by
          how directly comparable it is to the others.{" "}
          <a href="#methodology" className="underline hover:text-burgundy">
            Read the methodology note
          </a>
          .
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

      <section
        id="methodology"
        className="mt-16 scroll-mt-8 border-t border-beige pt-8 text-xs text-charcoal/60"
      >
        <h2 className="text-[10px] font-semibold uppercase tracking-wide text-charcoal/50">
          Methodology note
        </h2>
        <p className="mt-2 max-w-2xl">
          Built on NYC DOT Automated Traffic Volume Counts — a rotating
          survey, not continuous monitoring. Segments get counted for a
          window, then the survey moves on, so no two waypoints above were
          necessarily measured at the same time. That&apos;s why every point
          is tagged by evidence tier: concurrent points came from the same
          field study, bridge points are a different study but corridor-
          adjacent, directional points are different years and are used for
          direction/shape rather than exact magnitude, and the one anomaly
          point is shown because it doesn&apos;t fit the pattern — not
          because it does.
        </p>
      </section>
    </div>
  );
}
