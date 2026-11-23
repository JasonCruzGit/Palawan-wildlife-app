import ReportsQueue from "@/components/admin/ReportsQueue";

export const metadata = { title: "Reports" };

export default function AdminReportsPage() {
  return (
    <div>
      <div className="admin-rise">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
          Community channel
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">
          Report queue
        </h1>
        <p className="mt-1 max-w-xl text-sm text-ink-soft">
          Review community sightings. Verify to award points and publish map coordinates.
        </p>
      </div>

      <div className="admin-rise-delay mt-5">
        <ReportsQueue />
      </div>
    </div>
  );
}
