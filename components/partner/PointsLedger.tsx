"use client";

import { useEffect, useState } from "react";
import { readSession } from "@/lib/auth";
import { subscribeLiveSync } from "@/lib/live-sync";
import {
  POINTS_CHANGE_EVENT,
  POINTS_PER_VERIFIED_REPORT,
  POINTS_STORAGE_KEY,
  currentPointsYear,
  mergeLedger,
  readLocalLedger,
  yearTotal,
} from "@/lib/points";
import { REPORTS_STORAGE_KEY } from "@/lib/reports";
import type { PointsLedgerEntry } from "@/lib/types";

export default function PointsLedger() {
  const [entries, setEntries] = useState<PointsLedgerEntry[]>([]);
  const [allTime, setAllTime] = useState(0);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const year = currentPointsYear();

  useEffect(() => {
    const user = readSession();
    if (user) setEmail(user.email);
  }, []);

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(
          `/api/points?email=${encodeURIComponent(email)}&year=${year}`,
          { cache: "no-store" }
        );
        const data = (await res.json()) as {
          entries?: PointsLedgerEntry[];
          allTime?: number;
        };
        const merged = mergeLedger(data.entries ?? [], readLocalLedger()).filter(
          (e) => e.email.toLowerCase() === email.toLowerCase() && e.year === year
        );
        setEntries(merged);
        setAllTime(
          data.allTime ??
            mergeLedger(data.entries ?? [], readLocalLedger())
              .filter((e) => e.email.toLowerCase() === email.toLowerCase())
              .reduce((s, e) => s + e.points, 0)
        );
      } catch {
        const local = readLocalLedger().filter(
          (e) => e.email.toLowerCase() === email.toLowerCase()
        );
        setEntries(local.filter((e) => e.year === year));
        setAllTime(local.reduce((s, e) => s + e.points, 0));
      } finally {
        setLoading(false);
      }
    };

    load();
    window.addEventListener(POINTS_CHANGE_EVENT, load);
    const stop = subscribeLiveSync(load, [POINTS_STORAGE_KEY, REPORTS_STORAGE_KEY]);
    return () => {
      window.removeEventListener(POINTS_CHANGE_EVENT, load);
      stop();
    };
  }, [email, year]);

  const ytd = yearTotal(entries, email || "x", year);

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 @sm:grid-cols-3">
        <div className="border border-line border-l-[3px] border-l-signal px-3.5 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
            {year} total
          </p>
          <p className="mt-1.5 font-display text-3xl font-bold tabular-nums text-ink">{ytd}</p>
          <p className="mt-1 text-[11px] text-ink-soft">Accumulates through Dec 31</p>
        </div>
        <div className="border border-line px-3.5 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
            Per verified report
          </p>
          <p className="mt-1.5 font-display text-2xl font-bold tabular-nums text-ink">
            +{POINTS_PER_VERIFIED_REPORT}
          </p>
        </div>
        <div className="border border-line px-3.5 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
            All-time credits
          </p>
          <p className="mt-1.5 font-display text-2xl font-bold tabular-nums text-ink">{allTime}</p>
        </div>
      </div>

      <h2 className="mt-6 font-display text-lg font-bold tracking-tight text-ink">
        {year} ledger
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        Points post when an admin verifies your report. Year-end totals are the sum of this
        ledger.
      </p>

      {loading ? (
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          Loading ledger…
        </p>
      ) : entries.length === 0 ? (
        <div className="mt-8 border border-dashed border-line px-6 py-12 text-center">
          <p className="font-display text-lg font-bold text-ink">No points yet this year</p>
          <p className="mt-2 text-sm text-ink-soft">
            Submit reports and wait for admin verification to earn credits.
          </p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {entries.map((e) => (
            <li
              key={e.id}
              className="grid gap-1.5 py-3 @md:grid-cols-12 @md:items-center @md:gap-3"
            >
              <p className="font-mono text-[9px] uppercase tracking-wider text-ink-soft @md:col-span-3">
                {new Date(e.createdAt).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <div className="min-w-0 @md:col-span-7">
                <p className="font-medium text-ink">{e.speciesName}</p>
                <p className="text-sm text-ink-soft">{e.reason}</p>
              </div>
              <p className="font-display text-base font-bold text-lagoon @md:col-span-2 @md:text-right">
                +{e.points}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
