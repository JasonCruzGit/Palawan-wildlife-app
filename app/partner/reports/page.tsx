import Link from "next/link";
import MyReports from "@/components/partner/MyReports";

export const metadata = { title: "My reports" };

export default function PartnerReportsPage() {
  return (
    <div>
      <div className="admin-rise flex flex-col gap-3 @md:flex-row @md:flex-wrap @md:items-end @md:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
            History
          </p>
          <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-ink @sm:text-2xl">
            My reports
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Track pending, verified, and rejected submissions. Verified ones credit your yearly
            points.
          </p>
        </div>
        <Link
          href="/partner/report"
          className="shrink-0 border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink hover:border-ink @sm:py-1.5"
        >
          + New
        </Link>
      </div>
      <div className="admin-rise-delay mt-5">
        <MyReports />
      </div>
    </div>
  );
}
