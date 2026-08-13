"use client";

import { useState } from "react";
import { BENCHMARKS, FARES } from "@/lib/product-config";
import { supabase } from "@/lib/supabase";

export default function EmployersPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [employeesEnrolling, setEmployeesEnrolling] = useState(10);
  const employerPassMidpoint =
    (FARES.employerMonthly.priceMin + FARES.employerMonthly.priceMax) / 2;
  const estimatedEmployerCost = employerPassMidpoint * employeesEnrolling;
  const metroCardCost =
    BENCHMARKS.unlimitedMetroCardMonthly * employeesEnrolling;
  const monthlyDifference = metroCardCost - estimatedEmployerCost;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-navy">
        Employer &amp; institution passes
      </h1>
      <p className="mt-2 max-w-xl text-charcoal/70">
        A commute benefit for teams near Atlantic Terminal — independent of
        MTA Transit Check. ${FARES.employerMonthly.priceMin}–
        {FARES.employerMonthly.priceMax}/employee/month.
      </p>

      <section className="mt-10 max-w-md rounded-sm border border-beige bg-cream p-6">
        <h2 className="font-display text-xl font-semibold text-navy">
          Estimate your team&apos;s monthly pass cost
        </h2>
        <p className="mt-1 text-sm text-charcoal/60">
          A planning estimate using the midpoint of our current employer pass range.
        </p>

        <label className="mt-6 block text-sm text-charcoal/70">
          Employees enrolling
          <input
            type="number"
            min={1}
            value={employeesEnrolling}
            onChange={(e) =>
              setEmployeesEnrolling(Math.max(1, Number(e.target.value) || 1))
            }
            className="mt-1 w-full rounded-sm border border-beige bg-cream p-2 text-charcoal"
          />
        </label>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-charcoal/50">
              Shuttle estimate (midpoint)
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-navy">
              ${estimatedEmployerCost.toFixed(0)}
            </p>
            <p className="text-xs text-charcoal/50">per month for the group</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-charcoal/50">
              Unlimited MetroCard
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-navy">
              ${metroCardCost.toFixed(0)}
            </p>
            <p className="text-xs text-charcoal/50">per month for the group</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-charcoal/50">
              Monthly difference
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-burgundy">
              ${Math.abs(monthlyDifference).toFixed(0)} {monthlyDifference >= 0 ? "less" : "more"}
            </p>
            <p className="text-xs text-charcoal/50">
              than the MetroCard comparison
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 max-w-md rounded-sm border border-beige bg-cream p-6">
        {submitted ? (
          <p className="text-navy">
            Thanks — we&apos;ll follow up to set up a monthly invoice.
          </p>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setSubmitting(true);
              const form = e.currentTarget;
              const formData = new FormData(form);
              const employeeEstimateRaw = formData.get("employeeEstimate");

              const { error: insertError } = await supabase
                .from("employer_leads")
                .insert({
                  company_name: formData.get("companyName"),
                  work_email: formData.get("workEmail"),
                  employee_estimate: employeeEstimateRaw
                    ? Number(employeeEstimateRaw)
                    : null,
                });

              setSubmitting(false);
              if (insertError) {
                setError(
                  "Couldn't submit — " + insertError.message + ". Try again in a moment."
                );
                return;
              }
              setSubmitted(true);
            }}
            className="flex flex-col gap-4"
          >
            <label className="text-sm text-charcoal/70">
              Company name
              <input
                name="companyName"
                required
                className="mt-1 w-full rounded-sm border border-beige bg-cream p-2 text-charcoal"
              />
            </label>
            <label className="text-sm text-charcoal/70">
              Work email
              <input
                name="workEmail"
                required
                type="email"
                className="mt-1 w-full rounded-sm border border-beige bg-cream p-2 text-charcoal"
              />
            </label>
            <label className="text-sm text-charcoal/70">
              Employees interested (estimate)
              <input
                name="employeeEstimate"
                type="number"
                className="mt-1 w-full rounded-sm border border-beige bg-cream p-2 text-charcoal"
              />
            </label>
            {error && <p className="text-sm text-burgundy">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-sm bg-burgundy px-4 py-2 text-sm font-semibold text-cream hover:bg-burgundy-light disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Request a monthly pass quote"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
