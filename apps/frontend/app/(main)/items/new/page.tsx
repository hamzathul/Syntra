"use client";

import { ItemForm } from "@/components/items/item-form";

export default function NewItemPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Item</h1>
        <p className="text-muted-foreground">
          Add a product or service to your catalog
        </p>
      </div>

      <ItemForm />
    </div>
  );
}
