import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conserve",
  description: "Threats, field work, and how you can help protect Palawan wildlife.",
};

const threats = [
  {
    title: "Illegal wildlife trade",
    body: "Pangolins, parrots, and others move through black markets for meat, scales, and pets.",
  },
  {
    title: "Habitat loss",
    body: "Logging, farms, and shoreline build-out shrink forests, mangroves, and karst edges.",
  },
  {
    title: "Disturbance & persecution",
    body: "Hunting, snaring, and noisy trails push shy forest animals out of remaining cover.",
  },
];

const actions = [
  {
    title: "Rescue & release",
    body: "Injured or confiscated animals get care — and a path back when they can survive it.",
  },
  {
    title: "Community education",
    body: "Schools and barangays learn which species are endemic and why that matters.",
  },
  {
    title: "Habitat protection",
    body: "Critical forest and mangrove stands are monitored and argued for as protected ground.",
  },
];

export default function ConservationPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">Pressure</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Conservation
      </h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        What is pushing these animals out — and what field teams do about it.
      </p>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Threats</h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {threats.map((t, i) => (
            <div key={t.title} className="grid gap-2 py-6 sm:grid-cols-12 sm:gap-6">
              <p className="font-mono text-[11px] text-ink-soft sm:col-span-1">
                0{i + 1}
              </p>
              <h3 className="font-display text-xl font-bold text-ink sm:col-span-4">{t.title}</h3>
              <p className="text-ink-soft sm:col-span-7">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">On the ground</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          {actions.map((a) => (
            <div key={a.title}>
              <div className="mb-4 h-1 w-8 bg-signal" />
              <h3 className="font-display text-lg font-bold text-ink">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 bg-mangrove-deep px-6 py-12 text-mist sm:px-10">
        <h2 className="font-display text-2xl font-bold tracking-tight text-paper">
          What you can do
        </h2>
        <ul className="mt-5 space-y-3 text-mist/80">
          <li>Do not buy wild-caught pets or wildlife products.</li>
          <li>Report illegal trade to local authorities and DENR partners.</li>
          <li>Stay on trails; leave dens, nests, and diggings alone.</li>
          <li>Support local conservation groups and protected areas.</li>
          <li>In-app sighting reports arrive in phase 2.</li>
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/identify"
            className="bg-signal px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-paper hover:bg-signal-dark"
          >
            Identify wildlife
          </Link>
          <Link
            href="/about"
            className="border border-mist/30 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-paper hover:border-paper"
          >
            Partners
          </Link>
        </div>
      </section>
    </div>
  );
}
