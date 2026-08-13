import { ROUTE, DEMAND_PROFILE } from "./product-config";

// Waypoints in corridor order, deduped from the shuttle legs in ROUTE.
export const WAYPOINTS = Array.from(
  new Set(ROUTE.shuttles.flatMap((leg) => [leg.from, leg.to]))
);

// Atlantic Terminal carries ~2x any other point (see ROUTE note on the hub
// leg). Everything else is a baseline waypoint.
const HUB_LABEL = "Atlantic Terminal";

// pmOverAmRange is "65%-120% higher, every waypoint" — spread that measured
// range across the corridor so each waypoint's PM lift falls somewhere in
// it, with the hub landing at the high end.
const PM_LIFT_BY_WAYPOINT: Record<string, number> = {
  Canarsie: 0.65,
  "Eastern Pkwy / Utica Ave junction": 0.9,
  [HUB_LABEL]: 1.2,
  "Court St, Cobble Hill": 1.0,
};

const AM_PEAK_HOUR = 8; // mid-point of the 7-9am rush window
const PM_PLATEAU_START = 14; // 2pm
const PM_PLATEAU_END = 18; // 6pm, matches peakPlateauWindow

function amShape(hour: number): number {
  const d = hour - AM_PEAK_HOUR;
  return Math.exp(-(d * d) / 4.5); // narrow bell around the AM rush
}

function pmShape(hour: number): number {
  if (hour >= PM_PLATEAU_START && hour <= PM_PLATEAU_END) return 1;
  const edge = hour < PM_PLATEAU_START ? PM_PLATEAU_START - hour : hour - PM_PLATEAU_END;
  return Math.exp(-(edge * edge) / 3); // broad plateau, tapering at the edges
}

export type HourlyPoint = { hour: number; [waypoint: string]: number };

/**
 * Modeled hourly volume by waypoint. This shapes a curve from the measured
 * ranges in DEMAND_PROFILE (AM/PM windows, PM-over-AM lift, plateau width) —
 * it is not raw per-minute DOT counts. The full traffic-count data lives in
 * the ops dashboard's duckdb; this is the same evidence, illustrated.
 */
export function buildHourlyDemand(): HourlyPoint[] {
  const baseAmPeak = 100; // arbitrary index, not a headcount

  return Array.from({ length: 24 }, (_, hour) => {
    const point: HourlyPoint = { hour };
    for (const waypoint of WAYPOINTS) {
      const hubMultiplier = waypoint === HUB_LABEL ? 2 : 1;
      const pmLift = PM_LIFT_BY_WAYPOINT[waypoint] ?? 0.8;
      const amPeak = baseAmPeak * hubMultiplier;
      const pmPeak = amPeak * (1 + pmLift);
      const overnightFloor = amPeak * 0.08;
      const value =
        overnightFloor + amPeak * amShape(hour) + pmPeak * pmShape(hour);
      point[waypoint] = Math.round(value);
    }
    return point;
  });
}

export function isAmHour(hour: number): boolean {
  return hour >= 6 && hour < 11;
}

export function isPmHour(hour: number): boolean {
  return hour >= PM_PLATEAU_START - 2 && hour <= PM_PLATEAU_END + 1;
}

export { DEMAND_PROFILE };
