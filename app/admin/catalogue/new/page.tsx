import Link from "next/link";
import AddSpeciesForm from "@/components/admin/AddSpeciesForm";

export const metadata = { title: "Add entry" };

export default function AdminCatalogueNewPage() {
  return (
    <div>
      <div className="admin-rise">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
          <Link href="/admin/catalogue" className="hover:text-ink">
            Catalogue
          </Link>
          <span className="mx-2 text-line">/</span>
          New
        </p>
        <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-ink @sm:text-2xl">
          Add species or plant
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">
          Publish a new animal or plant into the field guide. Required fields are marked with *.
        </p>
      </div>

      <div className="admin-rise-delay mt-5 max-w-3xl border border-line bg-paper/80 p-3 @sm:p-5">
        <AddSpeciesForm />
      </div>
    </div>
  );
}
