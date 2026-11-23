import type { Metadata } from "next";
import PartnerGate from "@/components/partner/PartnerGate";
import PartnerSidebar from "@/components/partner/PartnerSidebar";
import PartnerTopBar from "@/components/partner/PartnerTopBar";

export const metadata: Metadata = {
  title: {
    default: "Community",
    template: "%s · Community · Palawan Wildlife",
  },
  robots: { index: false, follow: false },
};

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PartnerGate>
      <div className="admin-shell flex min-h-dvh min-h-screen flex-col bg-paper lg:flex-row">
        <PartnerSidebar />
        <div className="flex min-w-0 min-h-0 flex-1 flex-col">
          <PartnerTopBar />
          <div className="@container mx-auto w-full max-w-5xl flex-1 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
            {children}
          </div>
        </div>
      </div>
    </PartnerGate>
  );
}
