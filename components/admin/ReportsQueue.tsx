"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { subscribeLiveSync } from "@/lib/live-sync";
import { upsertLocalLedgerEntry } from "@/lib/points";
import {
  REPORTS_CHANGE_EVENT,
  REPORTS_STORAGE_KEY,
  countByStatus,
  mergeReports,
  readLocalReports,
  reconcileLocalReports,
  upsertLocalReport,
} from "@/lib/reports";
import type { PartnerReport, PointsLedgerEntry, ReportStatus } from "@/lib/types";

export default function ReportsQueue() {
  const [reports, setReports] = useState<PartnerReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ReportStatus>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/reports", { cache: "no-store" });
      const data = (await res.json()) as { reports?: PartnerReport[] };
      const server = data.reports ?? [];
      const merged = mergeReports(server, readLocalReports());
      reconcileLocalReports(merged);
      setReports(merged);
    } catch {
      setReports(readLocalReports());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(REPORTS_CHANGE_EVENT, load);
    const stop = subscribeLiveSync(load, [REPORTS_STORAGE_KEY]);
    return () => {
      window.removeEventListener(REPORTS_CHANGE_EVENT, load);
      stop();
    };
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "all") return reports;
    return reports.filter((r) => r.status === filter);
  }, [reports, filter]);

  const pending = countByStatus(reports, "pending");
  const verified = countByStatus(reports, "verified");
  const rejected = countByStatus(reports, "rejected");

  const review = async (id: string, status: "verified" | "rejected") => {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = (await res.json()) as {
        report?: PartnerReport;
        pointsEntry?: PointsLedgerEntry | null;
        error?: string;
      };
      if (!res.ok || !data.report) throw new Error(data.error || "Update failed.");
      upsertLocalReport(data.report);
      if (data.pointsEntry) upsertLocalLedgerEntry(data.pointsEntry);
      setReports((prev) => prev.map((r) => (r.id === id ? data.report! : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update report.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 @sm:grid-cols-3">
        {[
          { label: "Awaiting review", value: String(pending), key: "pending" as const },
          { label: "Verified", value: String(verified), key: "verified" as const },
          { label: "Rejected", value: String(rejected), key: "rejected" as const },
        ].map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setFilter(s.key)}
            className={`border border-l-[3px] px-4 py-4 text-left transition ${
              filter === s.key
                ? "border-ink border-l-signal bg-mist/50"
                : "border-line border-l-signal/70 hover:border-ink/40"
            }`}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
              {s.label}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-ink">{s.value}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
            filter === "all" ? "text-ink" : "text-ink-soft hover:text-ink"
          }`}
        >
          Show all ({reports.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-lagoon hover:underline"
        >
          Refresh
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-signal">{error}</p>}

      {loading ? (
        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          Loading queue…
        </p>
      ) : filtered.length === 0 ? (
        <div className="mt-10 border border-dashed border-line px-6 py-14 text-center">
          <p className="font-display text-xl font-bold text-ink">No reports here</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Community submissions from the member dashboard will appear here for verification.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {filtered.map((r) => (
            <li key={r.id} className="border border-line bg-paper">
              <div className="grid gap-3 p-3 @sm:grid-cols-[1fr_auto] @sm:gap-4 @sm:p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
                      {r.kind}
                    </span>
                    <span
                      className={`font-mono text-[9px] uppercase tracking-[0.14em] ${
                        r.status === "pending"
                          ? "text-signal"
                          : r.status === "verified"
                            ? "text-lagoon"
                            : "text-ink-soft"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-ink">
                    {r.speciesName}
                  </h3>
                  {r.scientificName && (
                    <p className="text-sm italic text-ink-soft">{r.scientificName}</p>
                  )}
                  <p className="mt-2 text-sm text-ink-soft">{r.location}</p>
                  <p className="mt-1 font-mono text-[10px] text-ink-soft/70">
                    {r.date}
                    {r.lat != null && r.lng != null
                      ? ` · ${r.lat.toFixed(3)}, ${r.lng.toFixed(3)}`
                      : ""}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink">{r.notes}</p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                    From {r.submittedBy} · {r.submittedByEmail}
                  </p>
                </div>
                {r.image && (
                  <div className="relative h-28 w-40 shrink-0 overflow-hidden bg-mist sm:h-32 sm:w-44">
                    <Image src={r.image} alt="" fill sizes="176px" className="object-cover" />
                  </div>
                )}
              </div>
              {r.status === "pending" && (
                <div className="flex flex-wrap gap-2 border-t border-line px-5 py-3">
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => review(r.id, "verified")}
                    className="bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-paper hover:bg-mangrove disabled:opacity-60"
                  >
                    Verify
                  </button>
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => review(r.id, "rejected")}
                    className="border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-signal hover:border-signal disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
