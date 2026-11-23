import type { Metadata } from "next";
import SightingsMapPanel from "@/components/SightingsMapPanel";
import { sightings } from "@/lib/species";

export const metadata: Metadata = {
  title: "Map",
  description: "Recent wildlife sightings reported across Palawan on OpenStreetMap.",
};

export default function MapPage() {
  const sorted = [...sightings].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#e04e1a]">
        Field desk
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Sightings
      </h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Verified field notes on OpenStreetMap, locked to Palawan. Tap a pin or a log row to focus
        the map.
      </p>

      <SightingsMapPanel sightings={sorted} />
    </div>
  );
}
