"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { lineString, point, along, length, distance, nearestPointOnLine } from "@turf/turf";
import { supabase } from "@/lib/supabase";
import { BRAND } from "@/lib/brand";

// Confirmed real coordinates (Google Places), [lng, lat] for GeoJSON/turf.
const CANARSIE: [number, number] = [-73.8978183, 40.6411714];
const EASTERN_PKWY_UTICA: [number, number] = [-73.9311213, 40.6688607];
const HUB: [number, number] = [-73.976977, 40.684568]; // Atlantic Terminal
const COURT_ST: [number, number] = [-73.9923751, 40.6896972];

// Order matters — this is what we send to Mapbox Directions as waypoints.
const DIRECTIONS_WAYPOINTS: [number, number][] = [
  CANARSIE,
  EASTERN_PKWY_UTICA,
  HUB,
  COURT_ST,
];

// Straight-line fallback if the Directions API call fails or hasn't been
// wired up with a working token yet — same shape the map used before this
// component followed real streets.
const FALLBACK_SEGMENT_A: [number, number][] = [CANARSIE, EASTERN_PKWY_UTICA, HUB];
const FALLBACK_SEGMENT_B: [number, number][] = [HUB, COURT_ST];


const HUB_PROXIMITY_KM = 0.06; // ~60m — both shuttles inside this = "connecting"
const SHUTTLE_1_PERIOD_MS = 14000; // Canarsie <-> hub, one-way
const SHUTTLE_2_PERIOD_MS = 9000; // hub <-> Court St, one-way — deliberately unsynced

type ShuttlePosition = {
  shuttle_id: string;
  lat: number;
  lng: number;
  updated_at: string;
};

/**
 * Fetches real driving-route geometry from Mapbox Directions, following
 * actual streets instead of connecting waypoints with a straight line.
 * Returns null (triggering the straight-line fallback) if the request
 * fails for any reason — no token, network error, bad response shape.
 */
async function fetchRouteGeometry(token: string): Promise<[number, number][] | null> {
  const coordStr = DIRECTIONS_WAYPOINTS.map(([lng, lat]) => `${lng},${lat}`).join(";");
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}?geometries=geojson&overview=full&access_token=${token}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    // Logged so the raw response shape can be checked against real streets
    // (should trace Utica Ave / Atlantic Ave, not a diagonal shortcut).
    console.log("Mapbox Directions API response:", data);
    const coords = data?.routes?.[0]?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return null;
    return coords as [number, number][];
  } catch (err) {
    console.error("Directions API fetch failed — falling back to straight-line route", err);
    return null;
  }
}

/**
 * Splits one continuous route (Canarsie -> ... -> Court St) into the two
 * shuttle segments at the point closest to the hub, so each shuttle's leg
 * can be colored and animated independently.
 */
function splitAtHub(coords: [number, number][]): {
  segA: [number, number][];
  segB: [number, number][];
} {
  const line = lineString(coords);
  const nearest = nearestPointOnLine(line, point(HUB), { units: "kilometers" });
  const idx = nearest.properties.index ?? 0;
  const hubCoord = nearest.geometry.coordinates as [number, number];
  const segA = [...coords.slice(0, idx + 1), hubCoord];
  const segB = [hubCoord, ...coords.slice(idx + 1)];
  return { segA, segB };
}

function triangleWave(elapsedMs: number, periodMs: number): number {
  const phase = (elapsedMs % (periodMs * 2)) / (periodMs * 2);
  return phase < 0.5 ? phase * 2 : 2 - phase * 2; // 0 -> 1 -> 0
}

function busIconDataUri(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22"><rect x="2" y="5" width="20" height="12" rx="3" fill="${color}"/><rect x="4" y="7" width="6" height="4" rx="1" fill="white" opacity="0.85"/><rect x="12" y="7" width="6" height="4" rx="1" fill="white" opacity="0.85"/><circle cx="7" cy="19" r="2" fill="${color}"/><circle cx="17" cy="19" r="2" fill="${color}"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function makeShuttleMarkerEl(color: string): HTMLDivElement {
  const el = document.createElement("div");
  el.style.width = "22px";
  el.style.height = "22px";
  el.style.backgroundImage = `url("${busIconDataUri(color)}")`;
  el.style.backgroundSize = "contain";
  el.style.backgroundRepeat = "no-repeat";
  return el;
}

function makeHubMarkerEl(): { el: HTMLDivElement; ring: HTMLDivElement } {
  const el = document.createElement("div");
  el.style.position = "relative";
  el.style.width = "20px";
  el.style.height = "20px";

  const ring = document.createElement("div");
  ring.className = "animate-ping";
  ring.style.position = "absolute";
  ring.style.inset = "0";
  ring.style.borderRadius = "50%";
  ring.style.background = "transparent";
  ring.style.border = `2px solid ${BRAND.gold}`;
  ring.style.opacity = "0.6";
  ring.style.display = "none";

  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.inset = "0";
  dot.style.borderRadius = "50%";
  dot.style.background = BRAND.navy;
  dot.style.border = `2px solid ${BRAND.gold}`;

  el.appendChild(ring);
  el.appendChild(dot);
  return { el, ring };
}

type ShuttleMapProps = {
  hoveredSegment?: "a" | "b" | null;
};

export default function ShuttleMap({ hoveredSegment = null }: ShuttleMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const hubRingRef = useRef<HTMLDivElement | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoveredSegmentRef = useRef<"a" | "b" | null>(hoveredSegment);
  const [isLive, setIsLive] = useState(false);

  function setSegmentHighlight(map: mapboxgl.Map) {
    if (
      !map.isStyleLoaded() ||
      !map.getLayer("corridor-a-line") ||
      !map.getLayer("corridor-b-line")
    ) {
      return;
    }

    map.setPaintProperty(
      "corridor-a-line",
      "line-width",
      hoveredSegmentRef.current === "a" ? 5 : 3
    );
    map.setPaintProperty(
      "corridor-b-line",
      "line-width",
      hoveredSegmentRef.current === "b" ? 5 : 3
    );
  }

  useEffect(() => {
    hoveredSegmentRef.current = hoveredSegment;
    const map = mapRef.current;
    if (map) setSegmentHighlight(map);
  }, [hoveredSegment]);

  function upsertRealMarker(map: mapboxgl.Map, pos: ShuttlePosition, color: string) {
    const existing = markersRef.current[pos.shuttle_id];
    if (existing) {
      existing.setLngLat([pos.lng, pos.lat]);
    } else {
      markersRef.current[pos.shuttle_id] = new mapboxgl.Marker(makeShuttleMarkerEl(color))
        .setLngLat([pos.lng, pos.lat])
        .addTo(map);
    }
  }

  function startSimulation(
    map: mapboxgl.Map,
    segA: [number, number][],
    segB: [number, number][]
  ) {
    const lineA = lineString(segA);
    const lineB = lineString(segB);
    const lenA = length(lineA, { units: "kilometers" });
    const lenB = length(lineB, { units: "kilometers" });

    markersRef.current["shuttle-1"] =
      markersRef.current["shuttle-1"] ??
      new mapboxgl.Marker(makeShuttleMarkerEl(BRAND.burgundy)).setLngLat(CANARSIE).addTo(map);
    markersRef.current["shuttle-2"] =
      markersRef.current["shuttle-2"] ??
      new mapboxgl.Marker(makeShuttleMarkerEl(BRAND.navy)).setLngLat(HUB).addTo(map);

    const startTime = performance.now();
    simIntervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress1 = triangleWave(elapsed, SHUTTLE_1_PERIOD_MS);
      const progress2 = triangleWave(elapsed, SHUTTLE_2_PERIOD_MS);

      const pos1 = along(lineA, progress1 * lenA, { units: "kilometers" }).geometry
        .coordinates as [number, number];
      const pos2 = along(lineB, progress2 * lenB, { units: "kilometers" }).geometry
        .coordinates as [number, number];

      markersRef.current["shuttle-1"]?.setLngLat(pos1);
      markersRef.current["shuttle-2"]?.setLngLat(pos2);

      const near1 = distance(point(pos1), point(HUB), { units: "kilometers" }) < HUB_PROXIMITY_KM;
      const near2 = distance(point(pos2), point(HUB), { units: "kilometers" }) < HUB_PROXIMITY_KM;
      if (hubRingRef.current) {
        hubRingRef.current.style.display = near1 && near2 ? "block" : "none";
      }
    }, 100);
  }

  function stopSimulation() {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    markersRef.current["shuttle-1"]?.remove();
    markersRef.current["shuttle-2"]?.remove();
    delete markersRef.current["shuttle-1"];
    delete markersRef.current["shuttle-2"];
    if (hubRingRef.current) hubRingRef.current.style.display = "none";
  }

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !mapContainer.current) return;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: HUB,
      zoom: 11.5,
    });
    mapRef.current = map;

    map.on("load", async () => {
      const realGeometry = await fetchRouteGeometry(token);
      const { segA, segB } = realGeometry
        ? splitAtHub(realGeometry)
        : { segA: FALLBACK_SEGMENT_A, segB: FALLBACK_SEGMENT_B };

      map.addSource("corridor-a", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: segA } },
      });
      map.addSource("corridor-b", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: segB } },
      });
      map.addLayer({
        id: "corridor-a-line",
        type: "line",
        source: "corridor-a",
        paint: { "line-color": BRAND.burgundy, "line-width": 3 },
      });
      map.addLayer({
        id: "corridor-b-line",
        type: "line",
        source: "corridor-b",
        paint: { "line-color": BRAND.navy, "line-width": 3 },
      });
      setSegmentHighlight(map);

      const { el: hubEl, ring } = makeHubMarkerEl();
      hubRingRef.current = ring;
      new mapboxgl.Marker(hubEl).setLngLat(HUB).addTo(map);

      // Load whatever's already in shuttle_positions. If nothing's there
      // yet, fall back to the simulated shuttles until a real row arrives
      // over the Realtime subscription below.
      const { data, error } = await supabase
        .from("shuttle_positions")
        .select("shuttle_id, lat, lng, updated_at")
        .order("updated_at", { ascending: false });

      const rows = (data as ShuttlePosition[] | null) ?? [];
      if (error || rows.length === 0) {
        startSimulation(map, segA, segB);
        return;
      }
      const latestByShuttle = new Map<string, ShuttlePosition>();
      for (const row of rows) {
        if (!latestByShuttle.has(row.shuttle_id)) latestByShuttle.set(row.shuttle_id, row);
      }
      latestByShuttle.forEach((pos) => {
        upsertRealMarker(map, pos, pos.shuttle_id === "shuttle-2" ? BRAND.navy : BRAND.burgundy);
      });
      setIsLive(true);
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
          upsertRealMarker(mapRef.current, pos, pos.shuttle_id === "shuttle-2" ? BRAND.navy : BRAND.burgundy);
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
      <div ref={mapContainer} className="h-80 w-full rounded-sm border border-beige" />
      <div
        className={`absolute left-3 top-3 rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
          isLive ? "bg-navy text-cream" : "border border-beige bg-cream text-charcoal/60"
        }`}
      >
        {isLive ? "● Live shuttle data" : "○ Simulated — no live shuttles yet"}
      </div>
    </div>
  );
}
