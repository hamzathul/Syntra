"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { companyApi } from "@/lib/api/erp-client";

export function CompanyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    companyApi
      .list()
      .then((companies) => {
        if (companies.length === 0) {
          router.replace("/onboarding");
        } else {
          setReady(true);
        }
      })
      .catch(() => {
        router.replace("/onboarding");
      });
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
