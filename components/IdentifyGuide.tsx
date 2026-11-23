"use client";

import { useMemo, useState } from "react";
import SpeciesCard from "./SpeciesCard";
import { colors, habitats, sizes } from "@/lib/species";
import type { Color, Habitat, Size, Species } from "@/lib/types";

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line bg-transparent text-ink-soft hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export default function IdentifyGuide({ all }: { all: Species[] }) {
  const [size, setSize] = useState<Size | "">("");
  const [color, setColor] = useState<Color | "">("");
  const [habitat, setHabitat] = useState<Habitat | "">("");

  const matches = useMemo(() => {
    return all.filter((s) => {
      if (size && s.size !== size) return false;
      if (color && !s.colors.includes(color)) return false;
      if (habitat && !s.habitats.includes(habitat)) return false;
      return true;
    });
  }, [all, size, color, habitat]);

  const clear = () => {
    setSize("");
    setColor("");
    setHabitat("");
  };

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">Size</h2>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <FilterBtn key={s} active={size === s} onClick={() => setSize(size === s ? "" : s)}>
              {s}
            </FilterBtn>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">Color</h2>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <FilterBtn key={c} active={color === c} onClick={() => setColor(color === c ? "" : c)}>
              {c}
            </FilterBtn>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          Habitat
        </h2>
        <div className="flex flex-wrap gap-2">
          {habitats.map((h) => (
            <FilterBtn
              key={h}
              active={habitat === h}
              onClick={() => setHabitat(habitat === h ? "" : h)}
            >
              {h}
            </FilterBtn>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between border-t border-line pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          {matches.length} match{matches.length !== 1 ? "es" : ""}
        </p>
        {(size || color || habitat) && (
          <button
            type="button"
            onClick={clear}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-signal hover:text-signal-dark"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
        {matches.map((s) => (
          <SpeciesCard key={s.id} species={s} />
        ))}
      </div>
    </div>
  );
}
