// Scheduled headway by hour of day. Derived from the same windows in
// DEMAND_PROFILE (product-config.ts) — frequency flexes with measured
// demand, fare does not. These are the service frequencies we'd run, not
// live GPS-derived intervals.
export type FrequencyBand = {
  label: string;
  hours: [number, number]; // inclusive start, exclusive end
  headwayMinutes: number;
};

export const FREQUENCY_BANDS: FrequencyBand[] = [
  { label: "Late night", hours: [23, 24], headwayMinutes: 40 },
  { label: "Late night", hours: [0, 6], headwayMinutes: 40 },
  { label: "Early morning", hours: [6, 7], headwayMinutes: 20 },
  { label: "AM rush", hours: [7, 9], headwayMinutes: 10 },
  { label: "Midday", hours: [9, 14], headwayMinutes: 20 },
  { label: "PM plateau", hours: [14, 18], headwayMinutes: 8 },
  { label: "PM rush tail", hours: [18, 19], headwayMinutes: 8 },
  { label: "Evening", hours: [19, 23], headwayMinutes: 15 },
];

export function bandForHour(hour: number): FrequencyBand {
  const band = FREQUENCY_BANDS.find((b) => hour >= b.hours[0] && hour < b.hours[1]);
  return band ?? FREQUENCY_BANDS[0];
}

// Expected wait for a random arrival under a fixed headway is half the
// headway, on average.
export function expectedWaitMinutes(hour: number): number {
  return Math.round(bandForHour(hour).headwayMinutes / 2);
}
