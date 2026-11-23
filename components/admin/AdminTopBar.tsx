"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
  "/admin": "Overview",
  "/admin/catalogue": "Catalogue",
  "/admin/catalogue/new": "Add entry",
  "/admin/sightings": "Sightings",
  "/admin/reports": "Reports",
};

export default function AdminTopBar() {
  const pathname = usePathname();
  const label =
    labels[pathname] ??
    Object.entries(labels)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([href]) => pathname === href || pathname.startsWith(href + "/"))?.[1] ??
    "Admin";

  const today = new Intl.DateTimeFormat("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-5 lg:px-6">
        <p className="min-w-0 truncate font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
          <Link href="/admin" className="hover:text-ink">
            Admin
          </Link>
          <span className="mx-2 text-line">/</span>
          <span className="text-ink">{label}</span>
        </p>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <p className="hidden font-mono text-[9px] uppercase tracking-[0.12em] text-ink-soft md:block">
            {today}
          </p>
          <Link
            href="/map"
            className="border border-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-soft transition hover:border-ink hover:text-ink"
          >
            Open map
          </Link>
        </div>
      </div>
    </div>
  );
}
