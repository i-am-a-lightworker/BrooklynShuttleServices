"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/lib/supabase";

// Real approximate coordinates for the four corridor waypoints from the
// traffic analysis. Order matters — this is the polyline the marker follows.
const ROUTE_COORDS: [number, number][] = [
  [-73.8993, 40.6396], // Canarsie (Rockaway Pkwy)
  [-73.9302, 40.6699], // Eastern Pkwy / Utica Ave junction
  [-73.9776, 40.684], // Atlantic Terminal
  [-73.9936, 40.6893], // Court St, Cobble Hill
];

function interpolate(
  a: [number, number],
  b: [number, number],
  t: number
): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

type ShuttlePosition = {
  shuttle_id: string;
  lat: number;
  lng: number;
  updated_at: string;
};

export default function ShuttleMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isLive, setIsLive] = useState(false);

  function makeMarkerEl() {
    const el = document.createElement("div");
    el.style.width = "14px";
    el.style.height = "14px";
    el.style.borderRadius = "50%";
    el.style.background = "#5E0000"; // burgundy
    el.style.border = "2px solid #0D1028"; // navy
    return el;
  }

  function startSimulation(map: mapboxgl.Map) {
    if (!markersRef.current["simulated"]) {
      markersRef.current["simulated"] = new mapboxgl.Marker(makeMarkerEl())
        .setLngLat(ROUTE_COORDS[0])
        .addTo(map);
    }
    let leg = 0;
    let t = 0;
    simIntervalRef.current = setInterval(() => {
      t += 0.02;
      if (t >= 1) {
        t = 0;
        leg = (leg + 1) % (ROUTE_COORDS.length - 1);
      }
      const pos = interpolate(ROUTE_COORDS[leg], ROUTE_COORDS[leg + 1], t);
      markersRef.current["simulated"]?.setLngLat(pos);
    }, 150);
  }

  function stopSimulation() {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    markersRef.current["simulated"]?.remove();
    delete markersRef.current["simulated"];
  }

  function upsertRealMarker(map: mapboxgl.Map, pos: ShuttlePosition) {
    const existing = markersRef.current[pos.shuttle_id];
    if (existing) {
      existing.setLngLat([pos.lng, pos.lat]);
    } else {
      markersRef.current[pos.shuttle_id] = new mapboxgl.Marker(makeMarkerEl())
        .setLngLat([pos.lng, pos.lat])
        .addTo(map);
    }
  }

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
    mapRef.current = map;

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

      // Load whatever's already in shuttle_positions (latest row per
      // shuttle_id). If nothing's there yet, fall back to the simulated
      // marker until a real row arrives over the Realtime subscription.
      supabase
        .from("shuttle_positions")
        .select("shuttle_id, lat, lng, updated_at")
        .order("updated_at", { ascending: false })
        .then(({ data, error }) => {
          const rows = (data as ShuttlePosition[] | null) ?? [];
          if (error || rows.length === 0) {
            startSimulation(map);
            return;
          }
          const latestByShuttle = new Map<string, ShuttlePosition>();
          for (const row of rows) {
            if (!latestByShuttle.has(row.shuttle_id)) {
              latestByShuttle.set(row.shuttle_id, row);
            }
          }
          latestByShuttle.forEach((pos) => upsertRealMarker(map, pos));
          setIsLive(true);
        });
    });

    // Real-time subscription: any insert/update on shuttle_positions moves
    // the matching marker and (if we were showing the simulated fallback)
    // switches the map over to live data.
    const channel = supabase
      .channel("shuttle_positions_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shuttle_positions" },
        (payload) => {
          const pos = payload.new as ShuttlePosition;
          if (!pos || !mapRef.current) return;
          if (simIntervalRef.current) stopSimulation();
          upsertRealMarker(mapRef.current, pos);
          setIsLive(true);
        }
      )
      .subscribe();

    return () => {
      stopSimulation();
      supabase.removeChannel(channel);
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
    <div className="relative">
      <div
        ref={mapContainer}
        className="h-80 w-full rounded-sm border border-beige"
      />
      <div
        className={`absolute left-3 top-3 rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
          isLive
            ? "bg-navy text-cream"
            : "bg-cream text-charcoal/60 border border-beige"
        }`}
      >
        {isLive ? "● Live shuttle data" : "○ Simulated — no live shuttles yet"}
      </div>
    </div>
  );
}
