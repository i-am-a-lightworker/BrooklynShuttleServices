import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { BRAND_NAME } from "@/lib/product-config";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
});
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Canarsie to Court St`,
  description:
    "Independent shuttle service connecting Canarsie, Atlantic Terminal, and Court St, Cobble Hill.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-cream font-sans text-charcoal">
        {/* Thin burgundy rule instead of a heavy dark nav bar — Theme 3
            (landing pages) treats burgundy/navy as accents, not fills. */}
        <header className="border-b-2 border-burgundy bg-cream">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <a
              href="/"
              className="font-display text-2xl font-semibold tracking-tight text-navy"
            >
              {BRAND_NAME}
            </a>
            <div className="flex gap-8 text-[11px] font-semibold uppercase tracking-wide text-charcoal">
              <a href="/pricing" className="hover:text-burgundy">
                Fares
              </a>
              <a href="/events" className="hover:text-burgundy">
                Barclays events
              </a>
              <a href="/employers" className="hover:text-burgundy">
                For employers
              </a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="mx-auto max-w-5xl border-t border-beige px-6 py-10 text-[10px] uppercase tracking-wide text-charcoal/50">
          {BRAND_NAME} is an independent shuttle service. Not affiliated
          with or operated by the MTA.
        </footer>
      </body>
    </html>
  );
}
