"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import {
  REPORTS_CHANGE_EVENT,
  REPORTS_STORAGE_KEY,
  countByStatus,
  mergeReports,
  readLocalReports,
  reconcileLocalReports,
} from "@/lib/reports";
import type { PartnerReport, PointsLedgerEntry } from "@/lib/types";

export default function PartnerOverview() {
  const [reports, setReports] = useState<PartnerReport[]>([]);
  const [entries, setEntries] = useState<PointsLedgerEntry[]>([]);
  const [name, setName] = useState("Partner");
  const [email, setEmail] = useState("");
  const year = currentPointsYear();

  useEffect(() => {
    const user = readSession();
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, []);

  useEffect(() => {
    if (!email) return;

    const load = async () => {
      try {
        const [rRes, pRes] = await Promise.all([
          fetch("/api/reports", { cache: "no-store" }),
          fetch(`/api/points?email=${encodeURIComponent(email)}&year=${year}`, {
            cache: "no-store",
          }),
        ]);
        const rData = (await rRes.json()) as { reports?: PartnerReport[] };
        const pData = (await pRes.json()) as { entries?: PointsLedgerEntry[] };
        const mine = (rData.reports ?? []).filter(
          (r) => r.submittedByEmail.toLowerCase() === email.toLowerCase()
        );
        const localMine = readLocalReports().filter(
          (r) => r.submittedByEmail.toLowerCase() === email.toLowerCase()
        );
        const merged = mergeReports(mine, localMine);
        reconcileLocalReports(merged);
        setReports(merged);
        setEntries(mergeLedger(pData.entries ?? [], readLocalLedger()));
      } catch {
        setReports(
          readLocalReports().filter((r) => r.submittedByEmail.toLowerCase() === email.toLowerCase())
        );
        setEntries(readLocalLedger());
      }
    };

    load();
    window.addEventListener(REPORTS_CHANGE_EVENT, load);
    window.addEventListener(POINTS_CHANGE_EVENT, load);
    const stop = subscribeLiveSync(load, [REPORTS_STORAGE_KEY, POINTS_STORAGE_KEY]);
    return () => {
      window.removeEventListener(REPORTS_CHANGE_EVENT, load);
      window.removeEventListener(POINTS_CHANGE_EVENT, load);
      stop();
    };
  }, [email, year]);

  const pending = countByStatus(reports, "pending");
  const verified = countByStatus(reports, "verified");
  const rejected = countByStatus(reports, "rejected");
  const ytd = yearTotal(entries, email || "x", year);
  const recent = useMemo(
    () => [...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4),
    [reports]
  );

  return (
    <div>
      <div className="admin-rise flex flex-col gap-3 @md:flex-row @md:flex-wrap @md:items-end @md:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
            Dashboard
          </p>
          <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-ink @sm:text-2xl">
            Welcome, {name.split(" ")[0]}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">
            For students, visitors, and anyone using the app — submit sightings, track review
            status, and build your {year} points toward year-end recognition.
          </p>
        </div>
        <Link
          href="/partner/report"
          className="shrink-0 bg-signal px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-paper hover:bg-signal-dark @sm:py-1.5"
        >
          + New report
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 @sm:grid-cols-2 @3xl:grid-cols-4">
        {[
          { label: `${year} points`, value: String(ytd), hint: "Accumulates to year-end" },
          { label: "Pending review", value: String(pending), hint: "Waiting on admin" },
          { label: "Verified", value: String(verified), hint: `+${POINTS_PER_VERIFIED_REPORT} pts each` },
          { label: "Rejected", value: String(rejected), hint: "No points awarded" },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-line border-l-[3px] border-l-lagoon bg-paper/80 px-3.5 py-3"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
              {s.label}
            </p>
            <p className="mt-1.5 font-display text-2xl font-bold tracking-tight tabular-nums text-ink">
              {s.value}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-ink-soft/80">{s.hint}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 grid gap-4 @3xl:grid-cols-5 @3xl:gap-6">
        <div className="border border-line bg-mist/25 px-3.5 py-4 @3xl:col-span-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
            Year-end tally
          </p>
          <h2 className="mt-1.5 font-display text-lg font-bold text-ink">{year} accumulation</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Every verified animal or plant report adds{" "}
            <span className="font-medium text-ink">{POINTS_PER_VERIFIED_REPORT} points</span>.
            Totals reset by calendar year and can be celebrated with schools and community groups
            at year-end.
          </p>
          <Link
            href="/partner/points"
            className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.12em] text-lagoon hover:underline"
          >
            View points ledger →
          </Link>
        </div>

        <div className="@3xl:col-span-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink">
              Recent reports
            </h2>
            <Link
              href="/partner/reports"
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-lagoon hover:underline"
            >
              All →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="mt-3 border border-dashed border-line px-4 py-8 text-center">
              <p className="text-sm text-ink-soft">No reports yet. Submit your first field note.</p>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-line border border-line">
              {recent.map((r) => (
                <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{r.speciesName}</p>
                    <p className="text-sm text-ink-soft">{r.location}</p>
                  </div>
                  <span
                    className={`shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] ${
                      r.status === "verified"
                        ? "text-lagoon"
                        : r.status === "pending"
                          ? "text-signal"
                          : "text-ink-soft"
                    }`}
                  >
                    {r.status}
                    {r.pointsAwarded ? ` · +${r.pointsAwarded}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-6 grid gap-2 @sm:grid-cols-2 @3xl:grid-cols-3">
        <Link
          href="/partner/report"
          className="border border-line bg-mist/30 px-3.5 py-4 transition hover:border-ink"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
            Action
          </p>
          <p className="mt-1.5 font-display text-base font-bold text-ink">Report species / plant</p>
          <p className="mt-1.5 text-sm text-ink-soft">
            One feature of your community desk — send to admin for review.
          </p>
        </Link>
        <Link
          href="/identify"
          className="border border-line bg-mist/30 px-3.5 py-4 transition hover:border-ink"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
            Field aid
          </p>
          <p className="mt-1.5 font-display text-base font-bold text-ink">Photo identify</p>
          <p className="mt-1.5 text-sm text-ink-soft">Name what you saw before filing a report.</p>
        </Link>
        <Link
          href="/map"
          className="border border-line bg-mist/30 px-3.5 py-4 transition hover:border-ink"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
            Context
          </p>
          <p className="mt-1.5 font-display text-base font-bold text-ink">Sightings map</p>
          <p className="mt-1.5 text-sm text-ink-soft">See verified field points across Palawan.</p>
        </Link>
      </section>
    </div>
  );
}
