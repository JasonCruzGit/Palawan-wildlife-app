import Image from "next/image";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import PendingReportsStat from "@/components/admin/PendingReportsStat";
import { categories, species, sightings } from "@/lib/species";

export const metadata = { title: "Overview" };

export default function AdminOverviewPage() {
  const animals = species.filter((s) => s.category !== "Plants");
  const plants = species.filter((s) => s.category === "Plants");
  const atRisk = species
    .filter((s) =>
      ["Critically Endangered", "Endangered", "Vulnerable"].includes(s.status)
    )
    .sort((a, b) => {
      const rank: Record<string, number> = {
        "Critically Endangered": 0,
        Endangered: 1,
        Vulnerable: 2,
      };
      return (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
    });

  const byCategory = categories.map((cat) => ({
    cat,
    count: species.filter((s) => s.category === cat).length,
  }));
  const maxCat = Math.max(...byCategory.map((c) => c.count), 1);

  const recent = [...sightings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const stats = [
    {
      label: "Catalogue entries",
      value: String(species.length),
      hint: "Published to public guide",
      accent: "border-l-mangrove",
      href: "/admin/catalogue",
    },
    {
      label: "Animals",
      value: String(animals.length),
      hint: "Mammals · birds · reptiles",
      accent: "border-l-lagoon",
      href: "/admin/catalogue?kind=animals",
    },
    {
      label: "Plants",
      value: String(plants.length),
      hint: "Flora in the field guide",
      accent: "border-l-mangrove",
      href: "/admin/catalogue?kind=plants",
    },
    {
      label: "At-risk taxa",
      value: String(atRisk.length),
      hint: "CR · EN · VU listings",
      accent: "border-l-signal",
      href: "/admin/catalogue?atRisk=1",
    },
    {
      label: "Logged sightings",
      value: String(sightings.length),
      hint: "Seeded field observations",
      accent: "border-l-lagoon",
      href: "/admin/sightings",
    },
  ];

  return (
    <div>
      <div className="admin-rise flex flex-col gap-3 @md:flex-row @md:items-end @md:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
            Dashboard
          </p>
          <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-ink @sm:text-2xl">
            Overview
          </h1>
          <p className="mt-1 max-w-lg text-sm text-ink-soft">
            Catalogue health, at-risk taxa, and recent field logs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/catalogue"
            className="bg-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-paper transition hover:bg-mangrove @sm:py-1.5"
          >
            Manage catalogue
          </Link>
          <Link
            href="/admin/sightings"
            className="border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink transition hover:border-ink @sm:py-1.5"
          >
            Field log
          </Link>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 @sm:grid-cols-2 @3xl:grid-cols-3">
        {stats.map((s, i) => (
          <Link
            key={s.label}
            href={s.href}
            className={`admin-rise block border border-line border-l-[3px] bg-paper/80 px-3.5 py-3 transition hover:border-ink hover:bg-mist/40 ${s.accent}`}
            style={{ animationDelay: `${0.04 + i * 0.04}s` }}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
              {s.label}
            </p>
            <p className="mt-1.5 font-display text-2xl font-bold tracking-tight tabular-nums text-ink">
              {s.value}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-ink-soft/80">{s.hint}</p>
          </Link>
        ))}
        <div className="admin-rise" style={{ animationDelay: "0.24s" }}>
          <PendingReportsStat />
        </div>
      </div>

      <div className="mt-7 grid gap-5 @3xl:grid-cols-5">
        <section className="admin-rise-delay @3xl:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-base font-bold tracking-tight text-ink">
              By category
            </h2>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-soft">
              {species.length} total
            </span>
          </div>
          <ul className="mt-3 space-y-2.5">
            {byCategory.map((row) => (
              <li key={row.cat}>
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink">
                    {row.cat}
                  </span>
                  <span className="font-display text-sm font-bold tabular-nums text-ink">
                    {row.count}
                  </span>
                </div>
                <div className="h-1 overflow-hidden bg-mist">
                  <div
                    className="admin-bar h-full bg-mangrove"
                    style={{ width: `${(row.count / maxCat) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-rise-delay @3xl:col-span-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-base font-bold tracking-tight text-ink">
              At-risk watchlist
            </h2>
            <Link
              href="/admin/catalogue?atRisk=1"
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-lagoon hover:underline"
            >
              Catalogue →
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-line border border-line">
            {atRisk.slice(0, 6).map((s) => (
              <li key={s.id} className="flex items-center gap-2.5 px-2.5 py-2">
                <div className="relative h-9 w-11 shrink-0 overflow-hidden bg-mist">
                  <Image src={s.image} alt="" fill sizes="44px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{s.name}</p>
                  <p className="truncate text-[11px] italic text-ink-soft">{s.scientificName}</p>
                </div>
                <div className="hidden @md:block">
                  <StatusBadge status={s.status} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="admin-rise-delay-2 mt-7">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-base font-bold tracking-tight text-ink">
            Recent sightings
          </h2>
          <Link
            href="/admin/sightings"
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-lagoon hover:underline"
          >
            View all →
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-line border border-line bg-paper">
          {recent.map((s, i) => (
            <li
              key={s.id}
              className="grid gap-1 px-3 py-2.5 @md:grid-cols-12 @md:items-center @md:gap-3"
            >
              <div className="flex items-center gap-2 @md:col-span-4">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-line font-mono text-[9px] text-ink-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Link
                  href={`/species/${s.speciesSlug}`}
                  className="text-sm font-medium text-ink hover:text-mangrove"
                  target="_blank"
                >
                  {s.speciesName}
                </Link>
              </div>
              <p className="text-xs text-ink-soft @md:col-span-5">{s.location}</p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-ink-soft @md:col-span-3 @md:text-right">
                {s.date}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 grid gap-2 @sm:grid-cols-2 @3xl:grid-cols-3">
        {[
          {
            href: "/admin/catalogue",
            kicker: "Content",
            title: "Catalogue desk",
            body: "Review published animals and plants.",
          },
          {
            href: "/admin/sightings",
            kicker: "Field",
            title: "Sighting log",
            body: "Seeded observations on the public map.",
          },
          {
            href: "/admin/reports",
            kicker: "Review",
            title: "Report queue",
            body: "Community submissions awaiting verification.",
          },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group border border-line bg-mist/30 px-3.5 py-3.5 transition hover:border-ink hover:bg-mist/50"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
              {card.kicker}
            </p>
            <p className="mt-1 font-display text-sm font-bold text-ink group-hover:text-mangrove">
              {card.title}
            </p>
            <p className="mt-1 text-xs text-ink-soft">{card.body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
