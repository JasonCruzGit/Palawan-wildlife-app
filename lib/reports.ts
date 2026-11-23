import type { PartnerReport, ReportStatus } from "@/lib/types";

export const REPORTS_STORAGE_KEY = "pw_partner_reports";
export const REPORTS_CHANGE_EVENT = "pw-reports-change";

const STATUS_RANK: Record<ReportStatus, number> = {
  pending: 0,
  rejected: 1,
  verified: 2,
};

export function readLocalReports(): PartnerReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PartnerReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalReports(reports: PartnerReport[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  window.dispatchEvent(new Event(REPORTS_CHANGE_EVENT));
}

/** Persist without dispatching — used after server merge to avoid fetch loops. */
export function writeLocalReportsQuiet(reports: PartnerReport[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

export function upsertLocalReport(report: PartnerReport) {
  const next = readLocalReports().filter((r) => r.id !== report.id);
  next.unshift(report);
  writeLocalReports(next);
}

/** Prefer the more advanced review state so stale local "pending" cannot beat server "verified". */
export function preferReport(a: PartnerReport, b: PartnerReport): PartnerReport {
  const aRev = a.reviewedAt ?? "";
  const bRev = b.reviewedAt ?? "";
  if (aRev !== bRev) return aRev > bRev ? a : b;

  const aRank = STATUS_RANK[a.status] ?? 0;
  const bRank = STATUS_RANK[b.status] ?? 0;
  if (aRank !== bRank) return aRank > bRank ? a : b;

  const aPts = a.pointsAwarded ?? 0;
  const bPts = b.pointsAwarded ?? 0;
  if (aPts !== bPts) return aPts > bPts ? a : b;

  return a.createdAt >= b.createdAt ? a : b;
}

export function mergeReports(server: PartnerReport[], local: PartnerReport[]) {
  const byId = new Map<string, PartnerReport>();
  for (const r of server) byId.set(r.id, r);
  for (const r of local) {
    const prev = byId.get(r.id);
    byId.set(r.id, prev ? preferReport(prev, r) : r);
  }
  return Array.from(byId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Align localStorage with merged server truth for the given report set. */
export function reconcileLocalReports(merged: PartnerReport[]) {
  const all = readLocalReports();
  const byId = new Map(all.map((r) => [r.id, r]));
  let changed = false;

  for (const r of merged) {
    const prev = byId.get(r.id);
    if (!prev) {
      byId.set(r.id, r);
      changed = true;
      continue;
    }
    const next = preferReport(prev, r);
    if (
      next.status !== prev.status ||
      next.reviewedAt !== prev.reviewedAt ||
      (next.pointsAwarded ?? 0) !== (prev.pointsAwarded ?? 0) ||
      next.reviewNote !== prev.reviewNote
    ) {
      byId.set(r.id, next);
      changed = true;
    }
  }

  if (changed) writeLocalReportsQuiet(Array.from(byId.values()));
}

export function countByStatus(reports: PartnerReport[], status: ReportStatus) {
  return reports.filter((r) => r.status === status).length;
}
