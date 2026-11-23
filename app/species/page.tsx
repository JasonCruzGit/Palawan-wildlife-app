import type { Metadata } from "next";
import SpeciesExplorer from "@/components/SpeciesExplorer";
import { species } from "@/lib/species";

export const metadata: Metadata = {
  title: "Species & Plants",
  description:
    "Catalogue of animals and plants recorded across the Palawan faunal region.",
};

export default function SpeciesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
        Catalogue
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Species &amp; Plants
      </h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Land mammals, birds, reptiles, and plants recorded across the Palawan faunal region —
        forests, mangroves, and karst edges. Water species are outside this guide.
      </p>
      <div className="mt-10">
        <SpeciesExplorer all={species} />
      </div>
    </div>
  );
}
