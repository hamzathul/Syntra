"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompany } from "@/lib/company-context";

export function CompanyGuard({ children }: { children: React.ReactNode }) {
  const { activeCompany, isLoading } = useCompany();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !activeCompany) {
      router.replace("/onboarding");
    }
  }, [activeCompany, isLoading, router]);

  return <>{children}</>;
}
