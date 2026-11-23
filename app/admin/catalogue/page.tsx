import { Suspense } from "react";
import Link from "next/link";
import CatalogueTable from "@/components/admin/CatalogueTable";
import { categories, species, statuses } from "@/lib/species";

export const metadata = { title: "Catalogue" };

export default function AdminCataloguePage() {
  return (
    <div>
      <div className="admin-rise flex flex-col gap-3 @md:flex-row @md:flex-wrap @md:items-end @md:justify-between">
        <div className="min-w-0 max-w-xl">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
            Content
          </p>
          <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-ink @sm:text-2xl">
            Catalogue
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Filter by category or threat status; open any entry on the public site.
          </p>
        </div>
        <Link
          href="/admin/catalogue/new"
          className="inline-flex shrink-0 items-center gap-1.5 bg-signal px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-paper transition hover:bg-signal-dark @sm:py-1.5"
        >
          <span aria-hidden>+</span>
          Add species / plant
        </Link>
      </div>

      <div className="admin-rise-delay mt-5">
        <Suspense
          fallback={
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              Loading catalogue…
            </p>
          }
        >
          <CatalogueTable entries={species} categories={categories} statuses={statuses} />
        </Suspense>
      </div>
    </div>
  );
}
