"use client";

import { useMemo, useState } from "react";
import SpeciesCard from "./SpeciesCard";
import { categories, statuses } from "@/lib/species";
import type { Category, Species, Status } from "@/lib/types";

export default function SpeciesExplorer({ all }: { all: Species[] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [status, setStatus] = useState<Status | "">("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return all.filter((s) => {
      if (category && s.category !== category) return false;
      if (status && s.status !== status) return false;
      if (!query) return true;
      return (
        s.name.toLowerCase().includes(query) ||
        s.localName.toLowerCase().includes(query) ||
        s.scientificName.toLowerCase().includes(query)
      );
    });
  }, [all, q, category, status]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="block flex-1 sm:max-w-xs">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Search
          </span>
          <input
            id="species-search"
            type="search"
            placeholder="Name or local name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input-field mt-1"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Category
          </span>
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "")}
            className="select-field mt-1 block w-full sm:w-auto"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Status
          </span>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status | "")}
            className="select-field mt-1 block w-full sm:w-auto"
          >
            <option value="">All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
        {filtered.length} entries
      </p>

      {filtered.length === 0 ? (
        <p className="border border-dashed border-line px-4 py-12 text-center text-ink-soft">
          No species match those filters.
        </p>
      ) : (
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <SpeciesCard key={s.id} species={s} />
          ))}
        </div>
      )}
    </div>
  );
}
