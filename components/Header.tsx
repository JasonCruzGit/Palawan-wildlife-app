"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, readSession, type AuthUser } from "@/lib/auth";

const baseLinks = [
  { href: "/species", label: "Catalogue" },
  { href: "/identify", label: "Identify" },
  { href: "/map", label: "Map" },
  { href: "/conservation", label: "Conserve" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const loginActive = pathname === "/login" || pathname.startsWith("/login/");
  const links =
    user?.role === "partner"
      ? [{ href: "/partner", label: "Community" }, ...baseLinks]
      : user?.role === "admin"
        ? [{ href: "/admin", label: "Admin" }, ...baseLinks]
        : baseLinks;

  useEffect(() => {
    const sync = () => setUser(readSession());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("pw-auth-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("pw-auth-change", sync);
    };
  }, [pathname]);

  const logout = () => {
    clearSession();
    setUser(null);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      {/* Mobile: centered title · Desktop/fullscreen: title on the left */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 md:gap-4">
        <div className="relative flex min-w-0 flex-1 items-center md:flex-none">
          <Link
            href="/"
            className="absolute left-1/2 max-w-[70vw] -translate-x-1/2 text-center font-display text-[0.95rem] font-bold uppercase tracking-[0.06em] text-ink md:static md:left-auto md:max-w-none md:translate-x-0 md:text-left md:text-[1.05rem] md:tracking-[0.08em]"
            onClick={() => setOpen(false)}
          >
            Palawan<span className="text-signal">·</span>Wildlife
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`font-mono text-[11px] uppercase tracking-[0.16em] transition ${
                    l.href === "/partner" || l.href === "/admin"
                      ? active
                        ? "text-signal"
                        : "text-signal hover:text-signal-dark"
                      : active
                        ? "text-ink"
                        : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                {user.role}
              </span>
              <button
                type="button"
                onClick={logout}
                className="border border-ink px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink hover:bg-ink hover:text-paper"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={`hidden font-mono text-[11px] font-medium uppercase tracking-[0.14em] transition md:inline-block ${
                loginActive
                  ? "bg-signal-dark px-3.5 py-2 text-paper"
                  : "bg-signal px-3.5 py-2 text-paper hover:bg-signal-dark"
              }`}
            >
              Login
            </Link>
          )}

          <button
            type="button"
            className="p-2 text-ink md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h10" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line px-4 py-4 md:hidden" aria-label="Mobile">
          <div className="flex flex-col items-center gap-1 text-center">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="w-full py-2.5 font-mono text-sm uppercase tracking-[0.14em] text-ink"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <button
                type="button"
                onClick={logout}
                className="mt-2 w-full border border-ink py-3 text-center font-mono text-sm uppercase tracking-[0.14em] text-ink"
              >
                Log out ({user.role})
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 w-full bg-signal py-3 text-center font-mono text-sm uppercase tracking-[0.14em] text-paper"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
