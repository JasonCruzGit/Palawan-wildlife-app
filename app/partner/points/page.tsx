import PointsLedger from "@/components/partner/PointsLedger";

export const metadata = { title: "Points" };

export default function PartnerPointsPage() {
  return (
    <div>
      <div className="admin-rise">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
          Recognition
        </p>
        <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-ink @sm:text-2xl">
          Yearly points
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">
          For students and anyone using the app: successful (verified) reports add points that
          accumulate until the end of the calendar year.
        </p>
      </div>
      <div className="admin-rise-delay mt-5">
        <PointsLedger />
      </div>
    </div>
  );
}
