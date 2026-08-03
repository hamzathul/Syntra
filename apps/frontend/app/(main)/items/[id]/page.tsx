"use client";

import { useParams } from "next/navigation";
import { useItems } from "@/hooks/items/use-items-query";
import { PageState } from "@/components/ui/page-state";
import { ItemForm } from "@/components/items/item-form";

export default function EditItemPage() {
  const params = useParams<{ id: string }>();
  const { data: items, isLoading, error } = useItems();

  const item = items?.find((i) => i.id === params.id);

  return (
    <PageState
      isLoading={isLoading}
      data={item}
      error={error}
      errorTitle="Failed to load item"
    >
      {(data) => (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
            <p className="text-muted-foreground">
              Edit item details, pricing, tax, and stock
            </p>
          </div>

          <ItemForm item={data} />
        </div>
      )}
    </PageState>
  );
}
