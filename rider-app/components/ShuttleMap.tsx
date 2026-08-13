"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Real approximate coordinates for the four corridor waypoints from the
// traffic analysis. Order matters — this is the polyline the marker follows.
const ROUTE_COORDS: [number, number][] = [
  [-73.8993, 40.6396], // Canarsie (Rockaway Pkwy)
  [-73.9302, 40.6699], // Eastern Pkwy / Utica Ave junction
  [-73.9776, 40.684], // Atlantic Terminal
  [-73.9936, 40.6893], // Court St, Cobble Hill
];

// SIMULATED POSITION FEED — no real vehicles exist yet. This interpolates a
// marker along ROUTE_COORDS on a timer, which is an honest stand-in for a
// real fleet. To swap in real tracking later: replace the setInterval below
// with a Supabase Realtime subscription on the `shuttle_positions` table
// (see lib/supabase.ts for the schema).
function interpolate(
  a: [number, number],
  b: [number, number],
  t: number
): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

export default function ShuttleMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !mapContainer.current) return;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: ROUTE_COORDS[1],
      zoom: 11.5,
    });

    map.on("load", () => {
      map.addSource("corridor", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: ROUTE_COORDS },
        },
      });
      map.addLayer({
        id: "corridor-line",
        type: "line",
        source: "corridor",
        paint: { "line-color": "#0D1028", "line-width": 3 }, // navy
      });

      const el = document.createElement("div");
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.borderRadius = "50%";
      el.style.background = "#5E0000"; // burgundy
      el.style.border = "2px solid #0D1028"; // navy
      markerRef.current = new mapboxgl.Marker(el)
        .setLngLat(ROUTE_COORDS[0])
        .addTo(map);
    });

    // Simulated movement: cycle through legs of the route every ~6s/leg.
    let leg = 0;
    let t = 0;
    const interval = setInterval(() => {
      if (!markerRef.current) return;
      t += 0.02;
      if (t >= 1) {
        t = 0;
        leg = (leg + 1) % (ROUTE_COORDS.length - 1);
      }
      const pos = interpolate(ROUTE_COORDS[leg], ROUTE_COORDS[leg + 1], t);
      markerRef.current.setLngLat(pos);
    }, 150);

    return () => {
      clearInterval(interval);
      map.remove();
    };
  }, []);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="flex h-80 items-center justify-center rounded-sm border border-dashed border-beige bg-cream text-sm text-charcoal/50">
        Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local to render the live map
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="h-80 w-full rounded-sm border border-beige"
    />
  );
}
