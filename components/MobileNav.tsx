"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { readSession, type AuthUser } from "@/lib/auth";

const publicTabs = [
  { href: "/", label: "Home" },
  { href: "/identify", label: "ID" },
  { href: "/species", label: "Life" },
  { href: "/map", label: "Map" },
  { href: "/about", label: "About" },
];

const partnerTabs = [
  { href: "/partner", label: "Hub" },
  { href: "/partner/report", label: "Report" },
  { href: "/partner/points", label: "Points" },
  { href: "/identify", label: "ID" },
  { href: "/map", label: "Map" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

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

  if (pathname.startsWith("/partner") || pathname.startsWith("/admin")) {
    return null;
  }

  const tabs = user?.role === "partner" ? partnerTabs : publicTabs;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/15 bg-ink/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))" }}
      aria-label="Mobile tabs"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 px-1 pt-1">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : tab.href === "/partner"
                ? pathname === "/partner"
                : pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="min-w-0">
              <Link
                href={tab.href}
                className={`flex min-h-12 flex-col items-center justify-center gap-1 px-0.5 py-2 font-mono text-[10px] uppercase leading-none tracking-[0.08em] ${
                  active ? "text-paper" : "text-paper/65"
                }`}
              >
                <span
                  className={`h-0.5 w-4 shrink-0 ${active ? "bg-signal" : "bg-transparent"}`}
                  aria-hidden
                />
                <span className="max-w-full truncate text-center">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
