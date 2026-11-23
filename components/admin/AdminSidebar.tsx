"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, readSession, type AuthUser } from "@/lib/auth";
import { useEffect, useState } from "react";

const iconClass = "h-3.5 w-3.5";

const nav = [
  {
    href: "/admin",
    label: "Overview",
    exact: true,
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    ),
  },
  {
    href: "/admin/catalogue",
    label: "Catalogue",
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M5 4h10a2 2 0 0 1 2 2v14l-4-2-4 2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14" />
        <path d="M9 8h5M9 12h5" />
      </svg>
    ),
  },
  {
    href: "/admin/sightings",
    label: "Sightings",
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
      </svg>
    ),
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M8 7h8M8 12h5M7 3h8l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
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

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUser(readSession());
  }, []);

  useEffect(() => {
    setOpen(false);
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
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(224,78,26,0.28), transparent 55%), radial-gradient(ellipse at 90% 80%, rgba(13,92,92,0.35), transparent 50%)",
          }}
        />
        <Link href="/admin" className="relative block" onClick={() => setOpen(false)}>
          <p className="font-display text-[0.95rem] font-bold uppercase tracking-[0.06em] text-paper">
            Palawan<span className="text-signal">·</span>Admin
          </p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-mist/60">
            Field control panel
          </p>
        </Link>
        <div className="relative mt-3 flex items-center gap-2">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-lagoon" />
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-mist/70">
            Live · demo
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3" aria-label="Admin">
        <p className="mb-1.5 px-2.5 font-mono text-[8px] uppercase tracking-[0.18em] text-mist/45">
          Workspace
        </p>
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`group relative flex min-h-10 items-center gap-2.5 px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                active
                  ? "bg-paper/12 text-paper"
                  : "text-mist/70 hover:bg-paper/6 hover:text-paper"
              }`}
            >
              {active && (
                <span className="absolute inset-y-1 left-0 w-0.5 bg-signal" aria-hidden />
              )}
              <span className={active ? "text-signal" : "text-mist/45 group-hover:text-mist/80"}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 bg-black/20 px-2 py-3">
        {user && (
          <div className="mb-2 flex items-center gap-2.5 px-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-signal font-display text-[10px] font-bold text-paper">
              {initials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-xs font-bold text-paper">{user.name}</p>
              <p className="truncate font-mono text-[8px] uppercase tracking-[0.1em] text-mist/50">
                {user.role}
              </p>
            </div>
          </div>
        )}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="block px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mist/70 transition hover:bg-paper/5 hover:text-paper"
        >
          ← Public site
        </Link>
        <button
          type="button"
          onClick={logout}
          className="w-full px-2.5 py-2 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-signal/90 transition hover:bg-signal/10 hover:text-paper"
        >
          Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-mangrove-deep px-3 py-2.5 lg:hidden">
        <Link
          href="/admin"
          className="min-w-0 truncate font-display text-sm font-bold uppercase tracking-[0.06em] text-paper"
        >
          Palawan<span className="text-signal">·</span>Admin
        </Link>
        <button
          type="button"
          className="shrink-0 border border-white/15 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-mist"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </header>

      {/* Desktop rail */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 bg-mangrove-deep text-mist lg:flex">
        {panel}
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(17.5rem,88vw)] flex-col border-r border-white/10 bg-mangrove-deep text-mist shadow-xl transition duration-300 lg:hidden ${
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
