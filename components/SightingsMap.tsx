"use client";

import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Sighting } from "@/lib/types";

type Props = {
  sightings: Sighting[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
};

const PALAWAN_CENTER: [number, number] = [10.0, 118.85];
const DEFAULT_ZOOM = 8;
/** Palawan province + Calamianes / Balabac — keeps pan/zoom on-island only. */
const PALAWAN_BOUNDS: [[number, number], [number, number]] = [
  [7.72, 116.82], // SW
  [12.38, 120.18], // NE
];
const MIN_ZOOM = 7;
const MAX_ZOOM = 15;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function SightingsMap({ sightings, activeId, onSelect }: Props) {
  const mapId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());
  const fittedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const boundsPoints = useMemo(
    () => sightings.map((s) => [s.lat, s.lng] as [number, number]),
    [sightings]
  );

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      if (!containerRef.current || mapRef.current) return;

      try {
        const L = (await import("leaflet")).default;
        if (cancelled || !containerRef.current) return;

        const bounds = L.latLngBounds(PALAWAN_BOUNDS);

        const map = L.map(containerRef.current, {
          center: PALAWAN_CENTER,
          zoom: DEFAULT_ZOOM,
          minZoom: MIN_ZOOM,
          maxZoom: MAX_ZOOM,
          maxBounds: bounds,
          maxBoundsViscosity: 1,
          scrollWheelZoom: false,
          attributionControl: true,
          worldCopyJump: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: MAX_ZOOM,
          bounds,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        map.setMaxBounds(bounds.pad(0.02));
        map.scrollWheelZoom.enable();
        mapRef.current = map;
        setReady(true);

        // Fix size after layout (Next/flex grids)
        requestAnimationFrame(() => {
          map.invalidateSize();
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    boot();

    return () => {
      cancelled = true;
      markersRef.current.clear();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    let cancelled = false;

    const syncMarkers = async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current) return;

      const map = mapRef.current;
      const nextIds = new Set(sightings.map((s) => s.id));

      for (const [id, marker] of markersRef.current) {
        if (!nextIds.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      }

      for (const s of sightings) {
        const isActive = s.id === activeId;
        const html = `
          <button type="button" class="pw-map-pin${isActive ? " is-active" : ""}" aria-label="${escapeHtml(s.speciesName)}">
            <span class="pw-map-pin-dot"></span>
          </button>
        `;
        const icon = L.divIcon({
          className: "pw-map-marker",
          html,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -12],
        });

        let marker = markersRef.current.get(s.id);
        if (!marker) {
          marker = L.marker([s.lat, s.lng], { icon }).addTo(map);
          marker.bindPopup(
            `<div class="pw-map-popup">
              <p class="pw-map-popup-title">${escapeHtml(s.speciesName)}</p>
              <p class="pw-map-popup-meta">${escapeHtml(s.location)}</p>
              <p class="pw-map-popup-date">${escapeHtml(s.date)}</p>
              <p class="pw-map-popup-notes">${escapeHtml(s.notes)}</p>
              <a class="pw-map-popup-link" href="/species/${encodeURIComponent(s.speciesSlug)}">Open guide →</a>
            </div>`
          );
          marker.on("click", () => onSelect?.(s.id));
          markersRef.current.set(s.id, marker);
        } else {
          marker.setLatLng([s.lat, s.lng]);
          marker.setIcon(icon);
        }
      }

      if (!fittedRef.current && boundsPoints.length > 0) {
        map.fitBounds(boundsPoints, { padding: [36, 36], maxZoom: 11 });
        fittedRef.current = true;
      }
    };

    syncMarkers();
    return () => {
      cancelled = true;
    };
  }, [ready, sightings, activeId, onSelect, boundsPoints]);

  useEffect(() => {
    if (!ready || !mapRef.current || !activeId) return;
    const marker = markersRef.current.get(activeId);
    if (!marker) return;
    const map = mapRef.current;
    map.panTo(marker.getLatLng(), { animate: true });
    marker.openPopup();
  }, [activeId, ready]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    const t = window.setTimeout(onResize, 120);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
  }, [ready]);

  if (failed) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-mist/40 px-6 text-center lg:aspect-auto lg:min-h-[440px]">
        <p className="max-w-sm text-sm text-ink-soft">
          Map tiles could not load. Check your connection, then refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border border-line bg-mist/30">
      <div
        id={`pw-map-${mapId}`}
        ref={containerRef}
        className="aspect-[4/3] w-full lg:aspect-auto lg:min-h-[440px]"
        role="region"
        aria-label="OpenStreetMap of Palawan wildlife sightings"
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-mangrove-deep/90">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mist/70">
            Loading map…
          </p>
        </div>
      )}
      <p className="pointer-events-none absolute bottom-2 left-2 z-[500] bg-paper/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
        OpenStreetMap · Palawan
      </p>
      <Link
        href="/partner/report"
        className="absolute right-2 top-2 z-[500] bg-signal px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-paper hover:bg-signal-dark"
      >
        + Report
      </Link>
    </div>
  );
}
