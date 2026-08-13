# Shuttle - The Brooklyn Way

Independent shuttle network: Canarsie → Eastern Pkwy/Utica Ave → Atlantic
Terminal → Court St, Cobble Hill. Not affiliated with the MTA.

This repo has two apps:

- **`rider-app/`** — Next.js + Tailwind rider-facing site. Route/hub display,
  fixed pricing, Stripe checkout (test mode), Barclays event bundle,
  employer lead form, simulated live shuttle map.
- **`ops-dashboard/`** — Streamlit dashboard built on the actual NYC DOT
  traffic-count analysis (`traffic.duckdb`, already included). This is what
  justifies the PM-weighted schedule with real data, not a claim.

All product decisions (fares, route legs, workforce roles) live in one file:
`rider-app/lib/product-config.ts`. Change numbers there, not across pages.

## Open this in Claude Code

```
cd shuttle-project
claude
```

Then something like: *"Run the rider app locally and help me wire up my
Supabase project"* — Claude Code can run commands, edit files, and iterate
with you directly, which this chat interface can't do (no live dev server,
no browser).

## Setup — rider-app

```bash
cd rider-app
npm install
cp .env.example .env.local   # fill in the three keys below
npm run dev
```

You need, in this order of urgency:
1. **Stripe** — dashboard.stripe.com → Developers → API keys → copy the
   **test mode** secret key (`sk_test_...`) into `STRIPE_SECRET_KEY`. This is
   what makes the "Buy" buttons on `/pricing` actually work.
2. **Supabase** — supabase.com → New project → Settings → API → copy the
   URL and anon key. Then run the SQL in `lib/supabase.ts` (as comments) in
   the Supabase SQL editor to create the `employer_leads` and
   `shuttle_positions` tables.
3. **Mapbox** — account.mapbox.com → Tokens → copy the default public token
   into `NEXT_PUBLIC_MAPBOX_TOKEN`. Without this the map on the home page
   shows a placeholder instead of failing.

Deploy: push to GitHub, import into Vercel, add the same three env vars in
the Vercel project settings.

## Setup — ops-dashboard

```bash
cd ops-dashboard
pip install -r requirements.txt
streamlit run dashboard.py
```

`traffic.duckdb` is already in this folder — it's the real database built
from the NYC DOT Automated Traffic Volume Counts dataset during this
project's research phase, filtered and verified for the corridor's six key
waypoints.

## What's real vs. simulated right now

| Piece | Status |
|---|---|
| Fixed pricing, route, waypoint evidence | Real — from the corridor analysis |
| Traffic data in the ops dashboard | Real — same duckdb file used throughout this project |
| Stripe checkout | Real flow, test-mode money |
| Employer lead form | Real form, needs a Supabase insert wired in (currently just flips a `submitted` flag — see the TODO comment in `app/employers/page.tsx`) |
| Shuttle position on the map | **Simulated** — a marker interpolated along the route on a timer. Say this plainly in any demo. Swap for Supabase Realtime once there's a real fleet feed — schema is sketched in `lib/supabase.ts` |

## 48-hour build order

1. **Hours 0–4** — `npm install`, get the three env vars in, confirm the app
   runs locally.
2. **Hours 4–16** — rider app core: route map, pricing, Stripe checkout end
   to end. This is what a reviewer touches first.
3. **Hours 16–24** — the simulated map is already built; wire the ops
   dashboard alongside it so you can show both in one demo.
4. **Hours 24–34** — polish the ops dashboard, pull in the funding doc
   (`docs/funding-and-workforce.md`) for the pitch narrative.
5. **Hours 34–42** — event bundle + employer form, both already scaffolded.
6. **Hours 42–48** — buffer. Don't schedule real work here.

See `docs/funding-and-workforce.md` for the reentry-employment funding
research and `rider-app/lib/product-config.ts` for every pricing/route number
in one place.
