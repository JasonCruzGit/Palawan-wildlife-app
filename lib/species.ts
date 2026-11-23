import speciesData from "@/data/species.json";
import sightingsData from "@/data/sightings.json";
import type { Category, Habitat, Sighting, Size, Species, Status, Color } from "./types";

export const species = speciesData as Species[];
export const sightings = sightingsData as Sighting[];

export const categories: Category[] = ["Mammals", "Birds", "Reptiles", "Plants"];
export const statuses: Status[] = [
  "Critically Endangered",
  "Endangered",
  "Vulnerable",
  "Near Threatened",
  "Least Concern",
];
export const sizes: Size[] = ["tiny", "small", "medium", "large"];
export const colors: Color[] = [
  "brown",
  "black",
  "gray",
  "green",
  "blue",
  "yellow",
  "white",
  "multicolor",
];
export const habitats: Habitat[] = [
  "forest",
  "mangrove",
  "coastal",
  "grassland",
];

export function getSpeciesBySlug(slug: string) {
  return species.find((s) => s.slug === slug);
}

export function getFeaturedSpecies() {
  return species.filter((s) =>
    ["Critically Endangered", "Endangered", "Vulnerable"].includes(s.status)
  );
}

export function statusTone(status: Status) {
  const map: Record<Status, string> = {
    "Critically Endangered": "text-signal border-signal",
    Endangered: "text-signal border-signal",
    Vulnerable: "text-signal-dark border-signal-dark",
    "Near Threatened": "text-ink-soft border-ink-soft",
    "Least Concern": "text-lagoon border-lagoon",
  };
  return map[status];
}

/** @deprecated use statusTone — kept for any lingering imports */
export function statusColor(status: Status) {
  return statusTone(status);
}
