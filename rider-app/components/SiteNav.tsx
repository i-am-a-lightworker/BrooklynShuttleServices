"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/pricing", label: "Fares" },
  { href: "/events", label: "Barclays events" },
  { href: "/employers", label: "For employers" },
  { href: "/careers", label: "Careers" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="text-charcoal hover:text-burgundy sm:hidden"
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setMobileOpen((isOpen) => !isOpen)}
      >
        {mobileOpen ? "✕" : "☰"}
      </button>
      <div
        className={`${mobileOpen ? "flex" : "hidden"} absolute right-0 top-full mt-3 flex-col gap-4 border border-beige bg-cream p-4 text-[11px] font-semibold uppercase tracking-wide text-charcoal sm:static sm:mt-0 sm:flex sm:flex-row sm:gap-8 sm:border-0 sm:p-0`}
      >
        {links.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <a
              key={href}
              href={href}
              className={`hover:text-burgundy ${isActive ? "text-burgundy" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
