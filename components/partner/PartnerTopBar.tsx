"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
  "/partner": "Overview",
  "/partner/messages": "Messages",
  "/partner/report": "New report",
  "/partner/reports": "My reports",
  "/partner/points": "Points",
};

export default function PartnerTopBar() {
  const pathname = usePathname();
  const label =
    labels[pathname] ??
    Object.entries(labels)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([href]) => pathname === href || pathname.startsWith(href + "/"))?.[1] ??
    "Community";

  return (
    <div className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-5 lg:px-6">
        <p className="min-w-0 truncate font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
          <Link href="/partner" className="hover:text-ink">
            Community
          </Link>
          <span className="mx-2 text-line">/</span>
          <span className="text-ink">{label}</span>
        </p>
        <Link
          href="/partner/report"
          className="shrink-0 bg-signal px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-paper hover:bg-signal-dark"
        >
          + Report
        </Link>
      </div>
    </div>
  );
}
