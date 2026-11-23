import Link from "next/link";
import { sightings } from "@/lib/species";

export const metadata = { title: "Sightings" };

export default function AdminSightingsPage() {
  const sorted = [...sightings].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="admin-rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
            Field log
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">
            Sightings
          </h1>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">
            {sorted.length} seeded observations on the public map.
          </p>
        </div>
        <Link
          href="/map"
          className="border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink transition hover:border-ink"
        >
          View on map
        </Link>
      </div>

      <div className="admin-rise-delay mt-5 grid grid-cols-1 gap-2 @sm:grid-cols-3">
        <div className="border border-line border-l-[3px] border-l-lagoon px-3 py-2.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
            Records
          </p>
          <p className="mt-0.5 font-display text-xl font-bold tabular-nums text-ink">
            {sorted.length}
          </p>
        </div>
        <div className="border border-line border-l-[3px] border-l-mangrove px-3 py-2.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
            Latest
          </p>
          <p className="mt-0.5 font-display text-xl font-bold text-ink">
            {sorted[0]?.date ?? "—"}
          </p>
        </div>
        <div className="border border-line border-l-[3px] border-l-signal px-3 py-2.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
            Source
          </p>
          <p className="mt-0.5 font-display text-sm font-bold text-ink">Demo seed data</p>
        </div>
      </div>

      <ol className="admin-rise-delay-2 mt-5 space-y-2">
        {sorted.map((s, i) => (
          <li
            key={s.id}
            className="border border-line bg-paper transition hover:border-ink/40"
          >
            <div className="grid gap-3 p-3 @sm:grid-cols-[auto_1fr_auto] @sm:items-start">
              <div className="flex h-8 w-8 items-center justify-center bg-mangrove-deep font-mono text-[10px] text-paper">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <Link
                    href={`/species/${s.speciesSlug}`}
                    className="font-display text-sm font-bold tracking-tight text-ink hover:text-mangrove"
                    target="_blank"
                  >
                    {s.speciesName}
                  </Link>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-ink-soft">
                    {s.date}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">{s.location}</p>
                <p className="mt-0.5 font-mono text-[9px] text-ink-soft/70">
                  {s.lat.toFixed(3)}° N · {s.lng.toFixed(3)}° E
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink">{s.notes}</p>
              </div>
              <Link
                href="/map"
                className="self-start font-mono text-[9px] uppercase tracking-[0.12em] text-lagoon hover:underline"
              >
                Map →
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
