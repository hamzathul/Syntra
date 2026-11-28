"use client";

import { useParams } from "next/navigation";
import { useItem } from "@/hooks/items/use-items-query";
import { PageState } from "@/components/ui/page-state";
import { PageHeader } from "@/components/ui/page-header";
import { ItemForm } from "@/components/items/item-form";

export default function EditItemPage() {
  const params = useParams<{ id: string }>();
  const { data: item, isLoading, error } = useItem(params.id);

  return (
    <PageState
      isLoading={isLoading}
      data={item}
      error={error}
      errorTitle="Failed to load item"
    >
      {(data) => (
        <div className="space-y-6">
          <PageHeader
            title={data.name}
            description="Edit item details, pricing, tax, and stock."
          />

          <ItemForm item={data} />
        </div>
      )}
    </PageState>
  );
}
