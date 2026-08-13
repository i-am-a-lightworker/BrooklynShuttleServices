import { WORKFORCE_ROLES } from "@/lib/product-config";

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-navy">
        The human roles in a driverless system
      </h1>
      <p className="mt-4 max-w-2xl text-charcoal/70">
        Removing the driver removes the highest-turnover job in transit — not
        the jobs. It reinvests in more stable operational roles, staffed
        through reentry employment partnerships rather than a standard hiring
        pipeline.
      </p>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        {WORKFORCE_ROLES.map((role) => (
          <div
            key={role.id}
            className="rounded-sm border border-beige bg-cream p-5"
          >
            <h2 className="font-display text-lg font-semibold text-navy">
              {role.label}
            </h2>
            {role.note && (
              <p className="mt-1 text-sm text-charcoal/70">{role.note}</p>
            )}
          </div>
        ))}
      </section>

      <section className="mt-16 rounded-sm border-l-2 border-burgundy bg-cream p-6 pl-8">
        <h2 className="font-display text-2xl font-semibold text-navy">
          Reentry employment partnerships
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-charcoal/70">
          We&apos;re building this workforce alongside the{" "}
          <strong className="text-navy">
            NYC Community Justice Reentry Network (CJRN)
          </strong>{" "}
          — the Mayor&apos;s Office of Criminal Justice program that funds
          paid transitional employment for justice-involved NYC residents —
          and{" "}
          <strong className="text-navy">The Fortune Society</strong>, whose
          core mission is reentry employment and who already run employer
          placement pipelines for exactly this kind of role.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-charcoal/70">
          Rider ambassador roles are shaped around onboarding cash-preferred,
          dollar-van riders onto fixed fares — direct, practical work, not a
          symbolic hire.
        </p>
      </section>
    </div>
  );
}
