"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SaleForm } from "@/components/sales/sale-form";
import { duplicateSaleFormValues } from "@/components/sales/sale-form-values";
import { PageState } from "@/components/ui/page-state";
import { useSale } from "@/hooks/sales/use-sales-query";

export default function NewSalePage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <NewSaleContent />
      </Suspense>
    </div>
  );
}

function NewSaleContent() {
  const searchParams = useSearchParams();
  const duplicateFrom = searchParams.get("duplicateFrom");
  if (!duplicateFrom) {
    return <SaleForm />;
  }
  return <DuplicateSaleLoader id={duplicateFrom} />;
}

function DuplicateSaleLoader({ id }: { readonly id: string }) {
  const { data, isLoading, error } = useSale(id);
  const initialValues = useMemo(
    () => (data ? duplicateSaleFormValues(data) : undefined),
    [data],
  );

  return (
    <PageState
      isLoading={isLoading}
      data={initialValues}
      error={error}
      errorTitle="Failed to load source sale"
    >
      {(values) => <SaleForm key={id} initialValues={values} isDuplicate />}
    </PageState>
  );
}
