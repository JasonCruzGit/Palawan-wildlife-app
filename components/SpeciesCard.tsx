import Image from "next/image";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import type { Species } from "@/lib/types";

export default function SpeciesCard({ species }: { species: Species }) {
  return (
    <Link href={`/species/${species.slug}`} className="group block">
      <div className="relative aspect-[5/4] overflow-hidden bg-mist">
        <Image
          src={species.image}
          alt={species.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-3 space-y-1.5">
        <StatusBadge status={species.status} />
        <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-ink group-hover:text-mangrove">
          {species.name}
        </h3>
        <p className="text-sm text-ink-soft">{species.localName}</p>
        <p className="font-mono text-[11px] italic text-ink-soft/70">{species.scientificName}</p>
      </div>
    </Link>
  );
}
