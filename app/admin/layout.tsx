import type { Metadata } from "next";
import AdminGate from "@/components/admin/AdminGate";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · Admin · Palawan Wildlife",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <div className="admin-shell flex min-h-dvh min-h-screen flex-col bg-paper lg:flex-row">
        <AdminSidebar />
        <div className="flex min-w-0 min-h-0 flex-1 flex-col">
          <AdminTopBar />
          <div className="@container mx-auto w-full max-w-5xl flex-1 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
            {children}
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
