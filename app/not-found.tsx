import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-28 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">404</p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
        Trail not found
      </h1>
      <p className="mt-2 text-ink-soft">That page is not in this guide.</p>
      <Link
        href="/"
        className="mt-8 inline-block bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-paper hover:bg-mangrove"
      >
        Back home
      </Link>
    </div>
  );
}
