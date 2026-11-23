"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readSession } from "@/lib/auth";
import { subscribeLiveSync } from "@/lib/live-sync";
import {
  REPORTS_CHANGE_EVENT,
  REPORTS_STORAGE_KEY,
  mergeReports,
  readLocalReports,
  reconcileLocalReports,
} from "@/lib/reports";
import type { PartnerReport } from "@/lib/types";

export default function MyReports() {
  const [reports, setReports] = useState<PartnerReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = readSession()?.email;
    if (!email) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch("/api/reports", { cache: "no-store" });
        const data = (await res.json()) as { reports?: PartnerReport[] };
        const mine = (data.reports ?? []).filter(
          (r) => r.submittedByEmail.toLowerCase() === email.toLowerCase()
        );
        const local = readLocalReports().filter(
          (r) => r.submittedByEmail.toLowerCase() === email.toLowerCase()
        );
        const merged = mergeReports(mine, local);
        reconcileLocalReports(merged);
        setReports(merged);
      } catch {
        setReports(
          readLocalReports().filter(
            (r) => r.submittedByEmail.toLowerCase() === email.toLowerCase()
          )
        );
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
        Loading reports…
      </p>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="border border-dashed border-line px-6 py-14 text-center">
        <p className="font-display text-xl font-bold text-ink">No submissions yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          File an animal or plant report to start your queue and points tally.
        </p>
        <Link
          href="/partner/report"
          className="mt-8 inline-block bg-signal px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-paper hover:bg-signal-dark"
        >
          New report
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {reports.map((r) => (
        <li key={r.id} className="border border-line bg-paper">
          <div className="grid gap-3 p-3 @sm:grid-cols-[1fr_auto] @sm:gap-4 @sm:p-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
                  {r.kind}
                </span>
                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.14em] ${
                    r.status === "verified"
                      ? "text-lagoon"
                      : r.status === "pending"
                        ? "text-signal"
                        : "text-ink-soft"
                  }`}
                >
                  {r.status}
                </span>
                {r.pointsAwarded ? (
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink">
                    +{r.pointsAwarded} pts
                  </span>
                ) : null}
              </div>
              <h3 className="mt-2 font-display text-base font-bold text-ink">{r.speciesName}</h3>
              <p className="text-sm text-ink-soft">{r.location}</p>
              <p className="mt-1 font-mono text-[9px] text-ink-soft/70">{r.date}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink">{r.notes}</p>
            </div>
            {r.image && (
              <div className="relative h-28 w-full overflow-hidden bg-mist @sm:h-24 @sm:w-36 @sm:shrink-0">
                <Image src={r.image} alt="" fill sizes="(max-width: 640px) 100vw, 144px" className="object-cover" />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
