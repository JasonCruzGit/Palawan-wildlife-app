import type { Metadata } from "next";
import Link from "next/link";
import IdentifyGuide from "@/components/IdentifyGuide";
import PhotoIdentifier from "@/components/PhotoIdentifier";
import { species } from "@/lib/species";

export const metadata: Metadata = {
  title: "Identify",
  description:
    "Identify Palawan animals and plants from a photo, or filter the field guide by size, color, and habitat.",
};

export default function IdentifyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">Field kit</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Identify
      </h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Photo ID for animals and plants via OpenAI — or filter the guide by size, color, and
        habitat when you already have a hunch.
      </p>

      <div className="mt-10">
        <PhotoIdentifier />
      </div>

      <div className="mt-16 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-12">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            Manual filter
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
            Field guide
          </h2>
          <p className="mt-2 max-w-lg text-ink-soft">
            No photo? Narrow the catalogue by traits.
          </p>
        </div>
        <Link
          href="/species"
          className="bg-signal px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-paper hover:bg-signal-dark"
        >
          Full catalogue
        </Link>
      </div>

      <div className="mt-10">
        <IdentifyGuide all={species} />
      </div>
    </div>
  );
}
