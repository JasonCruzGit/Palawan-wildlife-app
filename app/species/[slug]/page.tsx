import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { getSpeciesBySlug, species } from "@/lib/species";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return species.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getSpeciesBySlug(slug);
  if (!s) return { title: "Species not found" };
  return {
    title: s.name,
    description: s.description.slice(0, 160),
  };
}

export default async function SpeciesDetailPage({ params }: Props) {
  const { slug } = await params;
  const s = getSpeciesBySlug(slug);
  if (!s) notFound();

  return (
    <article>
      <div className="relative aspect-[16/9] min-h-[280px] w-full overflow-hidden bg-ink sm:aspect-[21/9]">
        <Image
          src={s.image}
          alt={s.name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 sm:pb-12">
          <div className="mx-auto max-w-6xl">
            <Link
              href="/species"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/70 hover:text-paper"
            >
              ← Catalogue
            </Link>
            <div className="mt-4">
              <StatusBadge status={s.status} onDark />
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-paper sm:text-6xl">
              {s.name}
            </h1>
            <p className="mt-2 text-lg text-paper/80">{s.localName}</p>
            <p className="font-mono text-sm italic text-paper/55">{s.scientificName}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
              {s.category}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-ink">{s.description}</p>

            <dl className="mt-10 space-y-8 border-t border-line pt-10">
              <Item term="Habitat" detail={s.habitat} />
              <Item
                term={s.category === "Plants" ? "Nutrition" : "Diet"}
                detail={s.diet}
              />
              <Item
                term="Threats"
                detail={
                  <ul className="space-y-2">
                    {s.threats.map((t) => (
                      <li key={t} className="border-l-2 border-signal pl-3">
                        {t}
                      </li>
                    ))}
                  </ul>
                }
              />
            </dl>
          </div>

          <aside className="lg:col-span-5">
            <div className="border border-line bg-mist/40 p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">
                Field notes
              </h2>
              <ul className="mt-5 space-y-4">
                {s.facts.map((f) => (
                  <li key={f} className="text-sm leading-relaxed text-ink-soft">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/identify"
              className="mt-6 flex w-full items-center justify-center bg-signal py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-paper hover:bg-signal-dark"
            >
              Identify in the field
            </Link>
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
              Sighting reports · phase 2
            </p>
          </aside>
        </div>
      </div>
    </article>
  );
}

function Item({ term, detail }: { term: string; detail: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">{term}</dt>
      <dd className="mt-2 text-ink">{detail}</dd>
    </div>
  );
}
