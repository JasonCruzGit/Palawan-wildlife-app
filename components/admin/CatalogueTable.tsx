"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { mergeCatalogue, readCatalogueExtras } from "@/lib/catalogue-extra";
import type { Category, Species, Status } from "@/lib/types";

const ALL = "All";
const AT_RISK: Status[] = ["Critically Endangered", "Endangered", "Vulnerable"];

export default function CatalogueTable({
  entries,
  categories,
  statuses,
}: {
  entries: Species[];
  categories: Category[];
  statuses: Status[];
}) {
  const searchParams = useSearchParams();
  const kindParam = searchParams.get("kind");
  const categoryParam = searchParams.get("category");
  const statusParam = searchParams.get("status");
  const atRiskParam = searchParams.get("atRisk") === "1";

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [kind, setKind] = useState<"all" | "animals" | "plants">("all");
  const [atRiskOnly, setAtRiskOnly] = useState(false);
  const [extras, setExtras] = useState<Species[]>([]);

  useEffect(() => {
    if (categoryParam && (categories as string[]).includes(categoryParam)) {
      setCategory(categoryParam);
    } else if (kindParam === "plants") {
      setCategory("Plants");
      setKind("plants");
    } else if (kindParam === "animals") {
      setCategory(ALL);
      setKind("animals");
    } else {
      setKind("all");
    }

    if (statusParam && (statuses as string[]).includes(statusParam)) {
      setStatus(statusParam);
      setAtRiskOnly(false);
    } else if (atRiskParam) {
      setStatus(ALL);
      setAtRiskOnly(true);
    } else {
      setAtRiskOnly(false);
    }
  }, [kindParam, categoryParam, statusParam, atRiskParam, categories, statuses]);

  useEffect(() => {
    const sync = () => setExtras(readCatalogueExtras());
    sync();
    window.addEventListener("pw-catalogue-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("pw-catalogue-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const allEntries = useMemo(
    () => mergeCatalogue(entries, extras),
    [entries, extras]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return allEntries
      .filter((s) => {
        if (kind === "animals") return s.category !== "Plants";
        if (kind === "plants") return s.category === "Plants";
        return true;
      })
      .filter((s) => (category === ALL ? true : s.category === category))
      .filter((s) => {
        if (atRiskOnly) return AT_RISK.includes(s.status);
        return status === ALL ? true : s.status === status;
      })
      .filter((s) => {
        if (!needle) return true;
        return (
          s.name.toLowerCase().includes(needle) ||
          s.scientificName.toLowerCase().includes(needle) ||
          s.localName.toLowerCase().includes(needle) ||
          s.slug.includes(needle)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allEntries, q, category, status, kind, atRiskOnly]);

  return (
    <div>
      <div className="grid gap-3 border border-line bg-mist/30 p-3 @md:grid-cols-[1fr_auto_auto] @md:items-end">
        <label className="block min-w-0 space-y-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
            Search
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, scientific, local…"
            className="input-field"
          />
        </label>
        <label className="block space-y-1 @md:w-40">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
            Category
          </span>
          <select
            className="select-field w-full"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setKind("all");
            }}
          >
            <option value={ALL}>All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 @md:w-48">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
            Status
          </span>
          <select
            className="select-field w-full"
            value={atRiskOnly ? "__at_risk__" : status}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__at_risk__") {
                setAtRiskOnly(true);
                setStatus(ALL);
              } else {
                setAtRiskOnly(false);
                setStatus(v);
              }
            }}
          >
            <option value={ALL}>All</option>
            <option value="__at_risk__">At-risk (CR · EN · VU)</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
        Showing {filtered.length} of {allEntries.length}
        {kind === "animals" ? " · animals only" : ""}
        {kind === "plants" ? " · plants only" : ""}
        {atRiskOnly ? " · at-risk" : ""}
      </p>

      <div className="mt-3 overflow-x-auto border border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-mist/50 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Entry</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Habitats</th>
              <th className="px-4 py-3 font-medium">Public</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((s) => (
              <tr key={s.id} className="align-middle transition hover:bg-mist/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden bg-mist">
                      <Image
                        src={s.image}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-ink">{s.name}</p>
                      <p className="text-xs italic text-ink-soft">{s.scientificName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                    {s.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-4 py-3 text-xs text-ink-soft">
                  {s.habitats.slice(0, 2).join(" · ")}
                  {s.habitats.length > 2 ? "…" : ""}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/species/${s.slug}`}
                    className="font-mono text-[10px] uppercase tracking-[0.14em] text-lagoon hover:underline"
                    target="_blank"
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-ink-soft">
                  No entries match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
