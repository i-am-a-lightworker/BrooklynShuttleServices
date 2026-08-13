"use client";

import { useState } from "react";
import { FARES } from "@/lib/product-config";

export default function EmployersPage() {
  const [submitted, setSubmitted] = useState(false);

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

      <div className="mt-10 max-w-md rounded-sm border border-beige bg-cream p-6">
        {submitted ? (
          <p className="text-navy">
            Thanks — we&apos;ll follow up to set up a monthly invoice.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Demo-only: replace with Supabase insert or a real CRM webhook.
              setSubmitted(true);
            }}
            className="flex flex-col gap-4"
          >
            <label className="text-sm text-charcoal/70">
              Company name
              <input
                required
                className="mt-1 w-full rounded-sm border border-beige bg-cream p-2 text-charcoal"
              />
            </label>
            <label className="text-sm text-charcoal/70">
              Work email
              <input
                required
                type="email"
                className="mt-1 w-full rounded-sm border border-beige bg-cream p-2 text-charcoal"
              />
            </label>
            <label className="text-sm text-charcoal/70">
              Employees interested (estimate)
              <input
                type="number"
                className="mt-1 w-full rounded-sm border border-beige bg-cream p-2 text-charcoal"
              />
            </label>
            <button
              type="submit"
              className="rounded-sm bg-burgundy px-4 py-2 text-sm font-semibold text-cream hover:bg-burgundy-light"
            >
              Request a monthly pass quote
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
