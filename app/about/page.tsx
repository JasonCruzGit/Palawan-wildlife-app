import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "About Palawan Wildlife, partners, and emergency rescue contacts.",
};

const partners = [
  "Katala Foundation Inc. (KFI)",
  "Local government units of Palawan",
  "Protected area rangers & DENR partners",
  "Community wildlife volunteers",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#e04e1a]">Station</p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-5xl">
        About
      </h1>
      <p className="mt-5 text-base leading-relaxed text-ink sm:text-lg">
        Palawan Wildlife is a public field guide and citizen desk for the island&apos;s endemic
        land animals and plants. Name what you see. Learn what threatens it. Send a report that
        can reach people who respond.
      </p>
      <p className="mt-4 leading-relaxed text-ink-soft">
        The public guide needs no account. Community reporters and field admins can sign in to
        submit and review sightings — built to grow with Katala Foundation and local rescue
        networks.
      </p>

      <section className="mt-14 border-t border-line pt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Partners</h2>
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {partners.map((p) => (
            <li key={p} className="py-3 text-ink">
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 border-l-4 border-signal bg-mist/50 px-6 py-8 sm:px-8">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
          Emergency rescue
        </h2>
        <p className="mt-3 text-ink-soft">
          Injured, trapped, or trafficked wildlife — call responders. Do not keep wild animals
          as pets.
        </p>
        <a
          href="tel:+639171234567"
          className="mt-5 inline-block font-display text-3xl font-bold tracking-tight text-signal hover:text-signal-dark"
        >
          +63 917 123 4567
        </a>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
          Placeholder — replace with official hotline
        </p>
      </section>

      <p className="mt-12 text-sm text-ink-soft">
        Need the field guide?{" "}
        <Link href="/identify" className="text-lagoon underline-offset-2 hover:underline">
          Open Identify
        </Link>
      </p>
    </div>
  );
}
