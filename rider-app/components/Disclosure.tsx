"use client";

import { useState, type ReactNode } from "react";

export default function Disclosure({
  trigger,
  triggerClassName,
  children,
}: {
  trigger: ReactNode;
  triggerClassName?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open && children}
    </div>
  );
}
