import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { IdentifyMode, IdentifyResult } from "@/lib/identify";

const CACHE_PATH = path.join(process.cwd(), "data", "identify-cache.json");
/** Reuse a result for the same image + mode for 30 days. */
export const IDENTIFY_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 200;

type CacheEntry = {
  key: string;
  mode: IdentifyMode;
  result: IdentifyResult;
  createdAt: string;
  hits: number;
};

type CacheFile = {
  entries: CacheEntry[];
};

export function identifyCacheKey(image: Buffer, mode: IdentifyMode) {
  const digest = createHash("sha256").update(image).update("|").update(mode).digest("hex");
  return digest;
}

async function readCache(): Promise<CacheFile> {
  try {
    const raw = await fs.readFile(CACHE_PATH, "utf8");
    const parsed = JSON.parse(raw) as CacheFile;
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    return { entries: [] };
  }
}

async function writeCache(data: CacheFile) {
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function isFresh(entry: CacheEntry, now = Date.now()) {
  const created = Date.parse(entry.createdAt);
  if (Number.isNaN(created)) return false;
  return now - created < IDENTIFY_CACHE_TTL_MS;
}

export async function getCachedIdentify(
  image: Buffer,
  mode: IdentifyMode
): Promise<IdentifyResult | null> {
  const key = identifyCacheKey(image, mode);
  const data = await readCache();
  const now = Date.now();
  const entry = data.entries.find((e) => e.key === key && e.mode === mode);
  if (!entry || !isFresh(entry, now)) return null;

  entry.hits += 1;
  // Best-effort hit bump; ignore write races
  try {
    await writeCache(data);
  } catch {
    /* ignore */
  }
  return entry.result;
}

export async function setCachedIdentify(
  image: Buffer,
  mode: IdentifyMode,
  result: IdentifyResult
) {
  const key = identifyCacheKey(image, mode);
  const data = await readCache();
  const now = Date.now();

  const fresh = data.entries.filter((e) => isFresh(e, now) && e.key !== key);
  fresh.unshift({
    key,
    mode,
    result,
    createdAt: new Date(now).toISOString(),
    hits: 0,
  });

  await writeCache({ entries: fresh.slice(0, MAX_ENTRIES) });
}
