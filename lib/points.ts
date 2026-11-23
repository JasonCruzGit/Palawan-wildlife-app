import type { PointsLedgerEntry } from "@/lib/types";

/** Points granted when admin verifies a partner report. */
export const POINTS_PER_VERIFIED_REPORT = 25;

export const POINTS_STORAGE_KEY = "pw_partner_points";
export const POINTS_CHANGE_EVENT = "pw-points-change";

export function currentPointsYear(date = new Date()) {
  return date.getFullYear();
}

export function readLocalLedger(): PointsLedgerEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(POINTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PointsLedgerEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalLedger(entries: PointsLedgerEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(POINTS_STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(POINTS_CHANGE_EVENT));
}

export function upsertLocalLedgerEntry(entry: PointsLedgerEntry) {
  const next = readLocalLedger().filter((e) => e.id !== entry.id);
  next.unshift(entry);
  writeLocalLedger(next);
}

export function mergeLedger(server: PointsLedgerEntry[], local: PointsLedgerEntry[]) {
  const byId = new Map<string, PointsLedgerEntry>();
  for (const e of server) byId.set(e.id, e);
  for (const e of local) byId.set(e.id, e);
  return Array.from(byId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function yearTotal(entries: PointsLedgerEntry[], email: string, year: number) {
  return entries
    .filter((e) => e.email.toLowerCase() === email.toLowerCase() && e.year === year)
    .reduce((sum, e) => sum + e.points, 0);
}

export function entriesForPartner(
  entries: PointsLedgerEntry[],
  email: string,
  year?: number
) {
  return entries.filter((e) => {
    if (e.email.toLowerCase() !== email.toLowerCase()) return false;
    if (year != null && e.year !== year) return false;
    return true;
  });
}
