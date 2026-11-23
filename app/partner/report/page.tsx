import PartnerReportForm from "@/components/PartnerReportForm";
import { POINTS_PER_VERIFIED_REPORT } from "@/lib/points";

export const metadata = { title: "New report" };

export default function PartnerReportPage() {
  return (
    <div>
      <div className="admin-rise">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
          Field desk
        </p>
        <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-ink @sm:text-2xl">
          Report species or plant
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">
          Submit a sighting for admin review. Verified reports earn{" "}
          <span className="text-ink">{POINTS_PER_VERIFIED_REPORT} points</span> toward your
          year-end total.
        </p>
      </div>
      <div className="admin-rise-delay mt-5 max-w-2xl border border-line bg-paper/80 p-3 @sm:p-5">
        <PartnerReportForm />
      </div>
    </div>
  );
}
