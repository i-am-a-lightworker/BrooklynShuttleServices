// Single source of truth for product decisions made during corridor research.
// Change prices/routes here, not scattered across pages.

export const BRAND_NAME = "Shuttle - The Brooklyn Way";

export const ROUTE = {
  name: "Canarsie – Atlantic Terminal – Court St",
  shuttles: [
    {
      id: "shuttle-1",
      label: "Shuttle 1",
      from: "Canarsie",
      to: "Eastern Pkwy / Utica Ave junction",
      evidenceTier: "concurrent", // same field study, Jul 6-19 2010
      note: "Remsen Ave + Utica Ave @ Empire Blvd, same 2-week study",
    },
    {
      id: "hub",
      label: "Atlantic Terminal",
      from: "Eastern Pkwy / Utica Ave junction",
      to: "Atlantic Terminal",
      evidenceTier: "bridge", // Washington Ave / Nostrand Ave, different eras
      note: "Core hub — ~2x the volume of any other measured point",
    },
    {
      id: "shuttle-2",
      label: "Shuttle 2",
      from: "Atlantic Terminal",
      to: "Court St, Cobble Hill",
      evidenceTier: "directional", // 2020 vs 2025, not concurrent
      note: "Atlantic Terminal (2020) + Court St (2025)",
    },
  ],
};

export const FARES = {
  singleRide: { price: 2.5, label: "Single ride", unit: "USD" },
  dayPass: { price: 6.5, label: "Day pass", unit: "USD" },
  tenRidePass: { price: 23.0, label: "10-ride pass", unit: "USD" },
  eventBundle: {
    price: 7.0,
    label: "Barclays event round trip",
    unit: "USD",
  },
  employerMonthly: {
    priceMin: 65,
    priceMax: 75,
    label: "Employer monthly pass (per employee)",
    unit: "USD",
    note: "Independent of MTA Transit Check — sold directly to employers",
  },
};

// Comparison anchors used throughout the pitch — keep these current.
export const BENCHMARKS = {
  subwayFare: 2.9,
  dollarVanFare: 2.0,
  unlimitedMetroCardMonthly: 132,
};

// Human roles in the otherwise-driverless system, staffed via reentry
// employment partnerships (see docs/funding-and-workforce.md).
export const WORKFORCE_ROLES = [
  {
    id: "teleoperator",
    label: "Remote safety monitor",
    note: "Human-in-the-loop oversight, likely a regulatory requirement",
  },
  {
    id: "steward",
    label: "Vehicle steward",
    note: "Charging, cleaning, positioning at the Atlantic Terminal hub",
  },
  {
    id: "ambassador",
    label: "Rider ambassador",
    note: "Fare enrollment / onboarding cash-preferred dollar-van riders",
  },
  {
    id: "dispatch",
    label: "Dispatch / customer service",
    note: "",
  },
  {
    id: "maintenance",
    label: "Fleet maintenance",
    note: "",
  },
];

// Demand shape from the traffic-count analysis — used to drive shuttle
// frequency, not fare price. See ops-dashboard/ for the full data behind this.
export const DEMAND_PROFILE = {
  amRushWindow: "7:00–9:00am",
  pmRushWindow: "4:00–7:00pm",
  pmOverAmRange: "65%–120% higher volume, every measured waypoint",
  peakPlateauWindow: "2:00pm–6:00pm", // broad plateau, not a narrow spike
  weekdayVsWeekend: "nearly equal at Canarsie-side waypoints",
};
