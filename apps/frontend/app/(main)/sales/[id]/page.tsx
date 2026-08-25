"use client";

import { useParams } from "next/navigation";
import { useSale } from "@/hooks/sales/use-sales-query";
import { PageState } from "@/components/ui/page-state";
import { SaleForm } from "@/components/sales/sale-form";

export default function EditSalePage() {
  const params = useParams<{ id: string }>();
  const { data: sale, isLoading, error } = useSale(params.id);

  return (
    <PageState
      isLoading={isLoading}
      data={sale}
      error={error}
      errorTitle="Failed to load sale"
    >
      {(data) => <SaleForm sale={data} />}
    </PageState>
  );
}
