import type { Species } from "@/lib/types";

export const CATALOGUE_EXTRA_KEY = "pw_catalogue_extra";

export function readCatalogueExtras(): Species[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CATALOGUE_EXTRA_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Species[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCatalogueExtra(entry: Species) {
  if (typeof window === "undefined") return;
  const existing = readCatalogueExtras().filter((s) => s.slug !== entry.slug);
  existing.push(entry);
  localStorage.setItem(CATALOGUE_EXTRA_KEY, JSON.stringify(existing));
  window.dispatchEvent(new Event("pw-catalogue-change"));
}

export function mergeCatalogue(seed: Species[], extras: Species[]): Species[] {
  const bySlug = new Map<string, Species>();
  for (const s of seed) bySlug.set(s.slug, s);
  for (const s of extras) bySlug.set(s.slug, s);
  return Array.from(bySlug.values());
}

export function slugifyName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
