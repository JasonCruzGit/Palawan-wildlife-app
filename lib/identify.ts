import type { Species } from "./types";

export type IdentifyKind = "animal" | "plant" | "other" | "unknown";
/** User selection before photo — animal (= species) or plant */
export type IdentifyMode = "animal" | "plant";

export function isIdentifyMode(value: unknown): value is IdentifyMode {
  return value === "animal" || value === "plant";
}

export type IdentifyAlternative = {
  commonName: string;
  scientificName: string;
  confidence: number;
};

export type IdentifyResult = {
  kind: IdentifyKind;
  commonName: string;
  scientificName: string;
  localName: string;
  confidence: number;
  summary: string;
  habitat: string;
  notes: string;
  matchedSlug: string | null;
  alternatives: IdentifyAlternative[];
};

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export function catalogueBrief(species: Species[]) {
  return species.map((s) => ({
    slug: s.slug,
    name: s.name,
    localName: s.localName,
    scientificName: s.scientificName,
    category: s.category,
  }));
}

export function buildIdentifyPrompt(
  catalogue: ReturnType<typeof catalogueBrief>,
  mode: IdentifyMode
) {
  const focus =
    mode === "plant"
      ? `The observer selected PLANT. Identify the plant (tree, shrub, palm, mangrove, orchid, fern, herb, cycad, pitcher plant, seagrass, etc.).
Set "kind" to "plant" unless the image clearly shows no plant — then use "unknown" and explain in notes.
Do not identify animals as the primary result.`
      : `The observer selected SPECIES (animal). Identify the animal — land or water (mammal, bird, reptile including sea turtles and crocodiles, amphibian, etc.).
Set "kind" to "animal" unless the image clearly shows no animal — then use "unknown" and explain in notes.
Do not identify plants as the primary result.
When matching the catalogue, prefer animal entries (including coastal and marine reptiles such as sea turtles).`;

  return `You are a field naturalist specializing in Palawan wildlife and plants, Philippines (UNESCO Biosphere Reserve) — forests, coasts, and nearshore waters.

Identify the subject in the image. Prefer Palawan / Philippine endemic or native taxa when plausible, including coastal and marine species present in the catalogue.

${focus}

Known catalogue entries (animals and plants — match matchedSlug only if clearly the same taxon):
${JSON.stringify(mode === "plant" ? catalogue.filter((c) => c.category === "Plants") : catalogue.filter((c) => c.category !== "Plants"))}

Return ONLY valid JSON with this exact shape:
{
  "kind": "animal" | "plant" | "other" | "unknown",
  "commonName": string,
  "scientificName": string,
  "localName": string,
  "confidence": number,
  "summary": string,
  "habitat": string,
  "notes": string,
  "matchedSlug": string | null,
  "alternatives": [{ "commonName": string, "scientificName": string, "confidence": number }]
}

Rules:
- confidence is 0 to 1
- localName: Filipino / Palawan local name if known, else ""
- matchedSlug: catalogue slug if it matches, else null
- alternatives: up to 3 other plausible IDs of the same mode (${mode})
- If unclear, kind "unknown", low confidence, explain in notes
- Be honest about uncertainty; do not invent certainty
- Keep summary to 2–3 sentences useful for a field observer`;
}

export function parseIdentifyResult(raw: string): IdentifyResult {
  const data = JSON.parse(raw) as Partial<IdentifyResult>;

  const kind = (["animal", "plant", "other", "unknown"] as const).includes(
    data.kind as IdentifyKind
  )
    ? (data.kind as IdentifyKind)
    : "unknown";

  const alternatives = Array.isArray(data.alternatives)
    ? data.alternatives.slice(0, 3).map((a) => ({
        commonName: String(a?.commonName ?? "Unknown"),
        scientificName: String(a?.scientificName ?? ""),
        confidence: clamp01(Number(a?.confidence ?? 0)),
      }))
    : [];

  return {
    kind,
    commonName: String(data.commonName ?? "Unknown"),
    scientificName: String(data.scientificName ?? ""),
    localName: String(data.localName ?? ""),
    confidence: clamp01(Number(data.confidence ?? 0)),
    summary: String(data.summary ?? ""),
    habitat: String(data.habitat ?? ""),
    notes: String(data.notes ?? ""),
    matchedSlug:
      typeof data.matchedSlug === "string" && data.matchedSlug.length > 0
        ? data.matchedSlug
        : null,
    alternatives,
  };
}

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
