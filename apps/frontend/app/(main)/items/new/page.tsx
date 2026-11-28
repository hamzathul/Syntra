"use client";

import { ItemForm } from "@/components/items/item-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewItemPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New item"
        description="Add a product or service to your catalog."
      />

      <ItemForm />
    </div>
  );
}
