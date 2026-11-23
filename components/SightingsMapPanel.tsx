"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";
import type { Sighting } from "@/lib/types";

const SightingsMap = dynamic(() => import("@/components/SightingsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[4/3] items-center justify-center border border-line bg-mangrove-deep lg:aspect-auto lg:min-h-[440px]">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mist/70">
        Loading map…
      </p>
    </div>
  ),
});

export default function SightingsMapPanel({ sightings }: { sightings: Sighting[] }) {
  const [activeId, setActiveId] = useState<string | null>(sightings[0]?.id ?? null);

  const onSelect = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <SightingsMap sightings={sightings} activeId={activeId} onSelect={onSelect} />
      </div>

      <div className="lg:col-span-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          Log · {sightings.length}
        </p>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {sightings.map((s) => {
            const active = s.id === activeId;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  className={`w-full py-4 text-left transition ${
                    active ? "bg-mist/50" : "hover:bg-mist/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 ${
                        active ? "bg-signal" : "bg-line"
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/species/${s.speciesSlug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-display text-lg font-bold tracking-tight text-ink hover:text-mangrove"
                      >
                        {s.speciesName}
                      </Link>
                      <p className="mt-1 text-sm text-ink-soft">{s.location}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-soft/70">
                        {new Date(s.date).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.notes}</p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        <Link
          href="/partner/report"
          className="mt-6 block border border-line px-4 py-3 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition hover:border-ink"
        >
          Submit a field report →
        </Link>
      </div>
    </div>
  );
}
