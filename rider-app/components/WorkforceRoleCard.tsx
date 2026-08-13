"use client";

import { useState } from "react";

type WorkforceRole = {
  id: string;
  label: string;
  note?: string;
};

const ROLE_DETAILS: Record<string, string> = {
  teleoperator:
    "Human-in-the-loop oversight in the driverless system, connected to the CJRN and The Fortune Society reentry employment partnerships described below.",
  steward:
    "One of the operational roles that replaces the driver position, staffed through the CJRN and The Fortune Society reentry employment partnerships described below.",
  ambassador:
    "A direct, practical role in the reentry employment partnerships with CJRN and The Fortune Society described below.",
  dispatch:
    "One of the stable operational roles supported through the CJRN and The Fortune Society reentry employment partnerships described below.",
  maintenance:
    "One of the stable operational roles supported through the CJRN and The Fortune Society reentry employment partnerships described below.",
};

export default function WorkforceRoleCard({ role }: { role: WorkforceRole }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full rounded-sm border border-beige bg-cream p-5 text-left"
      >
        <h2 className="font-display text-lg font-semibold text-navy">
          {role.label}
        </h2>
        {role.note && (
          <p className="mt-1 text-sm text-charcoal/70">{role.note}</p>
        )}
      </button>
      {open && (
        <div className="mt-2 rounded-sm border border-beige bg-cream p-3 text-sm text-charcoal/70">
          {ROLE_DETAILS[role.id]}
        </div>
      )}
    </div>
  );
}
