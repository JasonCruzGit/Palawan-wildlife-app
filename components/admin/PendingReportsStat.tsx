"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { subscribeLiveSync } from "@/lib/live-sync";
import {
  REPORTS_CHANGE_EVENT,
  REPORTS_STORAGE_KEY,
  countByStatus,
  mergeReports,
  readLocalReports,
  reconcileLocalReports,
} from "@/lib/reports";
import type { PartnerReport } from "@/lib/types";

export default function PendingReportsStat() {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/reports", { cache: "no-store" });
        const data = (await res.json()) as { reports?: PartnerReport[] };
        const merged = mergeReports(data.reports ?? [], readLocalReports());
        reconcileLocalReports(merged);
        setPending(countByStatus(merged, "pending"));
      } catch {
        setPending(countByStatus(readLocalReports(), "pending"));
      }
    };
    load();
    window.addEventListener(REPORTS_CHANGE_EVENT, load);
    const stop = subscribeLiveSync(load, [REPORTS_STORAGE_KEY]);
    return () => {
      window.removeEventListener(REPORTS_CHANGE_EVENT, load);
      stop();
    };
  }, []);

  return (
    <Link
      href="/admin/reports"
      className="block border border-line border-l-[3px] border-l-signal bg-paper/80 px-3.5 py-3 transition hover:border-ink hover:bg-mist/40"
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
        Pending reports
      </p>
      <p className="mt-1.5 font-display text-2xl font-bold tracking-tight tabular-nums text-ink">
        {pending}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-ink-soft/80">
        Community queue awaiting review
      </p>
    </Link>
  );
}
