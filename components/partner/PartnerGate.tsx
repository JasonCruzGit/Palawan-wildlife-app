"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readSession, type AuthUser } from "@/lib/auth";

export default function PartnerGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    const session = readSession();
    if (!session || session.role !== "partner") {
      router.replace("/login");
      return;
    }
    setUser(session);
  }, [router]);

  if (user === undefined) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-mangrove-deep text-paper">
        <div className="h-8 w-8 animate-spin rounded-full border border-paper/30 border-t-signal" />
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist/70">
          Checking access…
        </p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
