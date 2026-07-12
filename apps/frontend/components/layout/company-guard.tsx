"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getActiveCompany } from "@/lib/auth";

export function CompanyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!getActiveCompany()) {
      router.replace("/onboarding");
    }
  }, [router]);

  return <>{children}</>;
}
