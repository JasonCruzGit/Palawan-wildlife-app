"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal = pathname.startsWith("/admin") || pathname.startsWith("/partner");

  if (isPortal) {
    return <div className="min-h-screen bg-paper">{children}</div>;
  }

  return (
    <>
      <Header />
      <div className="pb-mobile-nav">
        <main>{children}</main>
        <Footer />
      </div>
      <MobileNav />
    </>
  );
}
