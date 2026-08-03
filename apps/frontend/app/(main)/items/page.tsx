"use client";

import Link from "next/link";
import { PlusIcon, PackageIcon } from "lucide-react";
import type { ItemDto } from "shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageState } from "@/components/ui/page-state";
import { useItems } from "@/hooks/items/use-items-query";

const currency = (value: number | null) =>
  value === null ? "—" : `$${value.toFixed(2)}`;

export default function ItemsPage() {
  const { data: items, isLoading, error } = useItems();

  return (
    <PageState
      isLoading={isLoading}
      data={items}
      error={error}
      errorTitle="Failed to load items"
    >
      {(data) => (
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Items</h1>
              <p className="text-muted-foreground">
                Manage your product and inventory catalog
              </p>
            </div>
            <Button asChild className="gap-1">
              <Link href="/items/new">
                <PlusIcon className="h-4 w-4" />
                New Item
              </Link>
            </Button>
          </div>

          <div className="border rounded-xl overflow-hidden">
            {data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Item</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Code</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Sale Price</th>
                      <th className="px-4 py-3 font-medium">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.map((item) => (
                      <ItemRow key={item.id} item={item} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <PackageIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">No items yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first item to start building your catalog.
                  </p>
                </div>
                <Button asChild variant="outline" className="gap-1">
                  <Link href="/items/new">
                    <PlusIcon className="h-4 w-4" />
                    New Item
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </PageState>
  );
}

function ItemRow({ item }: { item: ItemDto }) {
  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="px-4 py-3">
        <Link href={`/items/${item.id}`} className="font-medium hover:underline">
          {item.name}
        </Link>
      </td>
      <td className="px-4 py-3">
        <Badge variant={item.itemType === "SERVICE" ? "secondary" : "outline"}>
          {item.itemType}
        </Badge>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {item.itemCode ?? "—"}
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {item.category?.name ?? "—"}
      </td>
      <td className="px-4 py-3">{currency(item.salePriceExclTax)}</td>
      <td className="px-4 py-3 text-muted-foreground">
        {item.openingStock ?? "—"}
      </td>
    </tr>
  );
}
