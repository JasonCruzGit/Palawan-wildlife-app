"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, readSession, type AuthUser } from "@/lib/auth";
import { subscribeLiveSync } from "@/lib/live-sync";
import {
  MESSAGE_CHANGE_EVENT,
  readReadIds,
} from "@/lib/messages";
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
import type { CommunityMessage, PointsLedgerEntry } from "@/lib/types";

const iconClass = "h-4 w-4 shrink-0";

const nav = [
  {
    href: "/partner",
    label: "Overview",
    exact: true,
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    ),
  },
  {
    href: "/partner/messages",
    label: "Messages",
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M4 6h16v12H4V6Z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    ),
  },
  {
    href: "/partner/report",
    label: "New report",
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    href: "/partner/reports",
    label: "My reports",
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M8 7h8M8 12h5M7 3h8l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      </svg>
    ),
  },
  {
    href: "/partner/points",
    label: "Points",
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="m12 3 2.4 6.8H21l-5.4 4.2 2 6.8L12 17.2 6.4 20.8l2-6.8L3 9.8h6.6L12 3Z" />
      </svg>
    ),
  },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PartnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);
  const [ytd, setYtd] = useState(0);
  const [unread, setUnread] = useState(0);
  const year = currentPointsYear();

  useEffect(() => {
    const sync = () => setUser(readSession());
    sync();
    window.addEventListener("pw-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("pw-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const email = readSession()?.email;
    if (!email) return;

    const loadPoints = async () => {
      try {
        const res = await fetch(
          `/api/points?email=${encodeURIComponent(email)}&year=${year}`,
          { cache: "no-store" }
        );
        const data = (await res.json()) as { total?: number; entries?: PointsLedgerEntry[] };
        const merged = mergeLedger(data.entries ?? [], readLocalLedger());
        setYtd(yearTotal(merged, email, year));
      } catch {
        setYtd(yearTotal(readLocalLedger(), email, year));
      }
    };

    loadPoints();
    window.addEventListener(POINTS_CHANGE_EVENT, loadPoints);
    const stop = subscribeLiveSync(loadPoints, [POINTS_STORAGE_KEY, REPORTS_STORAGE_KEY]);
    return () => {
      window.removeEventListener(POINTS_CHANGE_EVENT, loadPoints);
      stop();
    };
  }, [year, pathname]);

  useEffect(() => {
    const loadUnread = async () => {
      try {
        const res = await fetch("/api/messages");
        const data = (await res.json()) as { messages?: CommunityMessage[] };
        const reads = readReadIds();
        setUnread((data.messages ?? []).filter((m) => !reads.has(m.id)).length);
      } catch {
        setUnread(0);
      }
    };
    loadUnread();
    window.addEventListener(MESSAGE_CHANGE_EVENT, loadUnread);
    return () => window.removeEventListener(MESSAGE_CHANGE_EVENT, loadUnread);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const logout = () => {
    clearSession();
    router.replace("/login");
  };

  const panel = (
    <>
      <div className="relative border-b border-white/10 px-3.5 pb-4 pt-5">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 15% 0%, rgba(224,78,26,0.4), transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(255,255,255,0.08), transparent 45%)",
          }}
        />
        <Link href="/partner" className="relative block min-w-0" onClick={() => setOpen(false)}>
          <p className="font-display text-[0.95rem] font-bold uppercase leading-[1.15] tracking-[0.04em] text-paper">
            Palawan
            <span className="text-signal">·</span>
            <br />
            Community
          </p>
          <p className="mt-1.5 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-mist/75">
            Students · visitors · anyone
          </p>
        </Link>

        <div className="relative mt-4 bg-paper/10 px-3 py-3 ring-1 ring-white/15">
          <div className="absolute inset-y-0 left-0 w-1 bg-signal" />
          <div className="flex items-end justify-between gap-2 pl-1">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-mist/70">
                {year} points
              </p>
              <p className="mt-1 font-display text-2xl font-bold leading-none tabular-nums text-paper">
                {ytd}
                <span className="ml-1 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-mist/60">
                  pts
                </span>
              </p>
            </div>
            <Link
              href="/partner/points"
              onClick={() => setOpen(false)}
              className="pb-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-mist/80 underline-offset-2 hover:text-paper hover:underline"
            >
              Ledger →
            </Link>
          </div>
          <p className="mt-2 pl-1 font-mono text-[9px] uppercase tracking-[0.12em] text-mist/65">
            +{POINTS_PER_VERIFIED_REPORT} per verified report
          </p>
          <div className="mt-3 h-1 overflow-hidden bg-black/25">
            <div
              className="h-full bg-signal/90 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(ytd > 0 ? 8 : 0, (ytd / 200) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-4" aria-label="Community">
        <p className="mb-1.5 px-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-mist/60">
          Workspace
        </p>
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const showUnread = item.href === "/partner/messages" && unread > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`group relative flex min-h-10 items-center gap-2.5 px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                active
                  ? "bg-paper/15 text-paper"
                  : "text-mist/80 hover:bg-paper/8 hover:text-paper"
              }`}
            >
              {active && (
                <span className="absolute inset-y-1 left-0 w-0.5 bg-signal" aria-hidden />
              )}
              <span className={active ? "text-signal" : "text-mist/55 group-hover:text-mist/90"}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {showUnread && (
                <span className="min-w-[1.25rem] bg-signal px-1.5 py-0.5 text-center text-[9px] font-medium tracking-wider text-paper">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}

        <Link
          href="/partner/report"
          onClick={() => setOpen(false)}
          className="mx-1 mt-3 bg-signal px-3 py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-paper transition hover:bg-signal-dark"
        >
          + File a report
        </Link>
      </nav>

      <div className="mt-auto border-t border-white/10 bg-black/25 px-2 py-3">
        {user && (
          <div className="mb-2 flex items-center gap-2.5 px-2">
            <div className="relative">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-signal font-display text-[10px] font-bold text-paper">
                {initials(user.name)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-lagoon bg-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-xs font-bold text-paper">{user.name}</p>
              <p className="truncate font-mono text-[8px] uppercase tracking-[0.12em] text-mist/65">
                Community member
              </p>
            </div>
          </div>
        )}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="block px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mist/80 transition hover:bg-paper/5 hover:text-paper"
        >
          ← Public site
        </Link>
        <button
          type="button"
          onClick={logout}
          className="w-full px-2.5 py-2 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-signal transition hover:bg-signal/10 hover:text-paper"
        >
          Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-lagoon px-3 py-2.5 lg:hidden">
        <Link
          href="/partner"
          className="min-w-0 truncate font-display text-sm font-bold uppercase tracking-[0.05em] text-paper"
        >
          Palawan<span className="text-signal">·</span>Community
        </Link>
        <button
          type="button"
          className="shrink-0 border border-white/20 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-paper"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </header>

      <aside className="hidden w-60 shrink-0 flex-col overflow-x-hidden border-r border-white/10 bg-gradient-to-b from-lagoon via-lagoon to-[#084848] text-mist lg:flex">
        {panel}
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(17.5rem,88vw)] flex-col border-r border-white/10 bg-gradient-to-b from-lagoon via-lagoon to-[#084848] text-mist shadow-xl transition duration-300 lg:hidden ${
          open ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
        aria-hidden={!open}
      >
        {panel}
      </aside>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/50 backdrop-blur-[2px] lg:hidden"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
