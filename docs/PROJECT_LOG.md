# Shuttle - The Brooklyn Way — Project Log

Full reference doc distilled from the research and build conversation for this
project. Meant to be read by Claude Code alongside the actual repo — this
captures the *why* behind decisions already baked into the code, plus a few
environment gotchas worth knowing before running anything.

---

## 1. What this is

An independent shuttle service (not MTA-affiliated) proposed for Brooklyn:
**Canarsie → Eastern Pkwy/Utica Ave junction → Atlantic Terminal → Court St,
Cobble Hill**. Framed as two distinct shuttles sharing one hub, not one
end-to-end route — see Section 3.

Name: **Shuttle - The Brooklyn Way** — an homage to Biggie Smalls and
Brooklyn pride (name chosen deliberately; no song lyrics are reproduced
anywhere in the project's copy, for copyright reasons).

---

## 2. The dataset and how it was used

**Source:** NYC Open Data, Socrata dataset `7ym2-wayt` — "Automated Traffic
Volume Counts." NYC DOT lays temporary road tubes for a few days at a time,
then relocates — a rotating survey, not permanent sensors. ~1.9M rows roll
up to only ~4,667 real count studies across ~3,391 street segments.

**API access:** No token required for public reads (a token only raises
rate limits). Use SoQL query params (`$select`, `$group`, `$where`,
`$order`/`$limit`/`$offset`) to aggregate server-side rather than pulling
the full dataset.

**Known data-quality traps** (worth encoding into any future analysis code):
- Row count / raw averages by year or borough reflect the deployment
  schedule, not real traffic trends — never rank by row count.
- `Vol = 0` is ambiguous (real overnight lull vs. dead sensor) — don't
  blindly drop or keep.
- One sentinel bad value: `Vol = -1` — filter `Vol >= 0`.
- ~2,800 rows use non-standard 10/20/40/50-minute bins instead of 15-minute.
- A few rows use combined-direction codes (`EW`/`NS`).
- Coverage collapsed post-2019 (2010–2014: 1,491 segments/1,123 studies vs.
  2020–2024: 478 segments/155 studies) — not a steady decline, a sharp
  post-2019 drop specifically.

**Full local analysis** lives in `ops-dashboard/traffic.duckdb` — built from
the raw CSV early in this project, 1,875,154 rows, already cleaned and typed.

---

## 3. The corridor evidence, by tier

Every claim in the product is labeled by how directly comparable its
evidence is — this labeling exists in the actual UI (`EvidenceBadge`
pattern) and in the pitch deck, not just in this doc.

### Shuttle 1 — Canarsie → Eastern Pkwy/Utica Ave junction
**Concurrent evidence** — same 2-week field study, July 6–19, 2010:
- Remsen Ave (Canarsie feeder): ~16,900 veh/day. AM rush (7–9am) 14,724,
  PM rush (4–7pm) 24,197 (+64%).
- Utica Ave @ Empire Blvd: ~13,000 veh/day. AM 4,586, PM 8,468 (+85%).
- Weekday vs weekend at Remsen Ave: nearly equal (~16,958 vs ~16,733/day) —
  suggests non-commute-only demand.

### Midpoint bridge — Eastern Pkwy / Nostrand-Franklin
No concurrent data exists here — presented as context only, different eras:
- Washington Ave @ Eastern Pkwy (May 2010): AM 7,431, PM 14,744.
- Nostrand Ave @ Clifton Pl (Dec 2024): AM 8,478, PM 18,718.
- **Franklin Ave @ Empire Blvd (Mar 2011): the one anomaly** — AM 1,663 >
  PM 1,294. Thin 3-day count, very low volume. Disclosed deliberately in
  the pitch deck rather than hidden — this is a credibility feature, not a
  bug to fix.

### Shuttle 2 — Atlantic Terminal → Court St
**Directional evidence** — different years, not concurrent:
- Atlantic Terminal (2020): ~31,500 veh/day combined directions. AM 42,126,
  PM 69,659 (+65%). This is the corridor's volume anchor — roughly double
  every other measured point.
- Court St (2025, most recent data in the set): ~8,800 veh/day. AM 5,046,
  PM 10,062 (+100%).

### The headline finding
**6 of 7 measured points show PM > AM**, spanning 2010–2025 across
independent studies that never coordinated with each other. This
consistency survived every stress test run against it (by borough, by
decade) — it's the strongest single argument in the whole project.

**No agency has ever run a synchronized count across the full corridor** —
a legitimate ask for a first funded pilot step (a modern simultaneous
corridor-wide count), rather than asking a funder to commit on 15-year-old
non-concurrent data alone.

### Methodology precedent (from earlier hypothesis testing on this dataset)
- Busier streets get recounted more often — Spearman r = 0.37–0.51 in
  *every* borough individually, and the correlation strengthens post-2015
  (r 0.31 → 0.61) as DOT's shrinking count budget concentrates on
  high-demand corridors.
- Weekday > weekend traffic holds citywide (+6.7%) but **reverses in the
  Bronx** (weekend +8% higher) — a reminder that citywide averages can hide
  real borough-level reversals.

---

## 4. Product & business model

**Two shuttles, one hub** — Atlantic Terminal is the "core," not just a
stop: highest volume, the natural transfer point, and the reason this reads
as one product instead of two unrelated routes.

**Fixed pricing** (chosen deliberately over demand/surge pricing — this
corridor already has an informal dollar-van market at ~$2, and the riders
are price-sensitive; surge pricing at peak hours reads as punitive to that
base, not clever):
| Tier | Price |
|---|---|
| Single ride | $2.50 |
| Day pass | $6.50 |
| 10-ride pass | $23.00 |
| Barclays event round trip | $7.00 |
| Employer monthly pass | $65–75/employee |

Benchmark context: subway swipe $2.90, dollar van $2.00. **Utica Ave is
literally the same street the informal dollar-van market already serves** —
independent confirmation of real demand there.

Demand is handled through **schedule frequency, not fare** — PM plateau
(2–6pm) runs shuttles every ~8 min, overnight every ~25 min, same $2.50
fare at every hour. This is deliberate: it's the honest way to "account for
demand" on a corridor already served by a price-sensitive informal market.

**Revenue model note:** $2.50 alone likely doesn't clear real per-vehicle
operating costs (rough estimate: $60–105/vehicle-hour once insurance,
remote safety monitoring, and platform overhead are included — treat as a
placeholder, not a quote). The fare is meant to be a subsidized anchor
price, carried by day passes/10-ride passes (fixes the card-processing-fee
problem a $2 single swipe has), employer contracts, event bundles, and
potentially a pilot subsidy — not something the single fare pays for on
its own. Say this plainly in any funder-facing material rather than
claiming per-ride profitability.

**Barclays event bundle:** sold as an add-on at ticket checkout via a venue
partnership (BSE Global), not marketed to individual attendees separately.

**Employer passes:** sold independent of MTA Transit Check — may still
qualify for pretax commuter-benefit treatment under IRC §132(f) as a
"qualified vanpool" service, but this needs confirmation from a tax/benefits
professional before it goes into a sales deck.

---

## 5. Workforce & funding (reentry employment angle)

Positioning: driverless removes the highest-turnover job (driving) and
reinvests in more stable operational roles, staffed via reentry employment
partnerships. Roles, with 2026 NYC-comparable salary estimates (see
`docs/funding-and-workforce.md` and the pitch deck for sourcing):

| Role | Est. salary | What it does |
|---|---|---|
| Remote safety monitor | $50K–$55K | Human-in-the-loop oversight, likely a regulatory requirement |
| Vehicle steward | $38K–$42K | Charging, cleaning, positioning at the hub |
| Rider ambassador | $38K–$45K | Helps cash-preferred riders enroll in the app fare system |
| Dispatch | $47K–$55K | Scheduling and day-to-day service adjustments |
| Fleet maintenance | $45K–$58K | Vehicle servicing and repair |

A modest pilot fleet (8–10 vehicles) could reasonably support **15–25
positions** across these five roles — jobs scale at the fleet level, not
one-to-one per vehicle, unlike a driver-per-vehicle model.

**Funding sources, live as of this research:**
- **NYC Community Justice Reentry Network (CJRN)** — Mayor's Office of
  Criminal Justice; funds paid transitional employment directly. The
  closest thing to a direct city wage subsidy currently available.
- **DOL Reentry Employment Opportunities (REO) grants** — federal, but
  typically flows to nonprofit intermediaries, not directly to a private
  employer. Partner with an existing grantee rather than applying directly.
- **DOJ Second Chance Act grants** — similar shape to REO.
- **WOTC (Work Opportunity Tax Credit)** — **lapsed Jan 1, 2026**, pending
  Congressional reauthorization. Historically reinstated retroactively.
  Don't put this in a funding deck as a current line item.
- **Warm intro available:** Shalinthia is a graduate of The Fortune
  Society's Women Rising program and has interviewed for a Grant Writer
  role there — a natural first partner conversation, not a cold outreach.

---

## 6. Tech stack & repo structure

```
shuttle-project/
├── rider-app/          Next.js 14 + Tailwind, rider-facing site
│   ├── lib/product-config.ts   <- SINGLE SOURCE OF TRUTH for fares,
│   │                               route legs, workforce roles. Edit
│   │                               here, not scattered across pages.
│   ├── components/ShuttleMap.tsx   Simulated shuttle position on a
│   │                               straight-line route (real Mapbox
│   │                               Directions API routing was scoped
│   │                               but not yet confirmed built)
│   ├── app/pricing/, /events/, /employers/   Stripe checkout (test mode),
│   │                               event bundle, employer lead form
│   └── lib/supabase.ts         Client + commented SQL for
│                                 employer_leads and shuttle_positions
│                                 tables (Realtime-ready schema)
├── ops-dashboard/       Streamlit + DuckDB, internal data tool
│   ├── dashboard.py     Waypoint selector, branded Altair charts
│   └── traffic.duckdb   Full cleaned dataset (22MB)
└── docs/funding-and-workforce.md
```

**Branding applied throughout** (from Shalinthia's existing real estate
brand standards, reused deliberately rather than inventing a new identity):
burgundy `#5E0000` (primary accent/CTAs), navy `#0D1028` (structural/
secondary), charcoal `#24221F` (body text), cream `#F6F3EE` (canvas), beige
`#D9D3CB` (borders/gridlines), gold `#B08D57` (subtle callouts only, never
a fill). Typography: Cormorant Garamond (display/headlines) + Inter
(body/UI/data) — loaded via Google Fonts `<link>`, not just CSS
`font-family` references (a real bug from an earlier pass: referencing a
font name without importing it silently falls back to Georgia).

Signature logo (`Shalinthia` script mark, black-on-transparent) is embedded
as base64 in the pitch deck footer — keeps the file single-portable, no
separate asset to lose track of.

---

## 7. Environment gotchas — read before running anything

These cost real time during the build session; worth avoiding a repeat:

1. **Cloud vs. Local sessions in Claude Code Desktop are not
   interchangeable, and can't be switched mid-session.** A Cloud session
   clones the repo into an ephemeral remote sandbox — `localhost` in that
   sandbox is NOT reachable from the actual machine's browser, no matter
   what port is used. If a dev server reports "Ready" but the browser gets
   `ERR_CONNECTION_REFUSED` on every port tried, check Local vs. Cloud
   *first*, before touching ports. Confirm explicitly: "Is this session
   Local or Cloud?" Fix: start a genuinely new session and pick Local
   explicitly at creation — it cannot be changed after the fact by talking
   to the existing session.
2. **`git init` must run inside the actual project folder, not a parent
   directory holding multiple unrelated projects.** Running it one level
   too high will start tracking every sibling project folder. Always
   confirm the working directory (`Get-Location`/`pwd` + `dir`/`ls`) before
   running any git command for the first time in a new terminal.
2b. **Zip extraction on Windows sometimes adds an extra nested folder**
   (matching the zip's internal top-level folder name) — check with `dir`
   before assuming you're at the repo root.
3. **Port collisions are normal, not a sign of a real problem** — Next.js
   defaults to 3000, Streamlit to 8501. If another project already holds
   that port, just run on a different one (`next dev -p 3005`,
   `streamlit run dashboard.py --server.port 8502`) rather than debugging
   the "wrong" port.
4. **A `git push` rejection on a freshly-created repo usually just means
   local and remote have unrelated histories** (e.g. GitHub already has a
   placeholder README commit). `--force` is reasonable when nothing on the
   remote is worth keeping; `git pull --allow-unrelated-histories` is the
   non-destructive alternative.
5. **Claude Code may default to opening a PR instead of committing to
   `main`.** Neither is wrong, but pick one explicitly and tell Claude Code
   so it's not inconsistent across sessions.
6. **Never paste a Supabase `sb_secret_...` key anywhere** (this chat
   included) — only the `sb_publishable_...` key belongs in
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If a secret key is ever exposed,
   rotate it in Supabase's dashboard immediately; treat it as burned, not
   as a still-valid secret.

---

## 8. Outstanding / not yet built

- **Real Mapbox Directions API routing** for `ShuttleMap.tsx` — currently
  straight-line interpolation between 4 coordinates; a prompt for real
  street-following geometry + independent shuttle timing + a "connecting"
  state at the hub was written but not yet confirmed implemented.
- **Evidence-layer pattern sitewide** — `lib/evidence-data.ts`,
  `EvidenceBadge.tsx`, and an interactive Recharts evidence chart on the
  home page were specced but not yet confirmed built.
- **Supabase tables** (`employer_leads`, `shuttle_positions`) — schema is
  commented in `lib/supabase.ts`, needs to actually be run in Supabase's
  SQL editor.
- **Real Stripe/Supabase/Mapbox keys** — pipeline is wired, needs live
  credentials in `.env.local` (never committed).
- **Interactive pitch deck** exists as a standalone file
  (`Shuttle-The-Brooklyn-Way-Pitch.html`) — self-contained, not part of the
  Next.js app; could be ported into the site as a page if wanted.

---

## 9. Real coordinates (for anything geo-related)

Confirmed via Google Places, safe to hardcode:
1. Canarsie (Rockaway Pkwy): `40.6411714, -73.8978183`
2. Eastern Pkwy & Utica Ave: `40.6688607, -73.9311213`
3. Atlantic Terminal (hub): `40.6845680, -73.9769770`
4. Court St & Atlantic Ave: `40.6896972, -73.9923751`
