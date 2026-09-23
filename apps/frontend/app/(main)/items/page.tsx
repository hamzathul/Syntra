"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Package as PackageIcon } from "lucide-react";
import type { ItemDto } from "shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageState } from "@/components/ui/page-state";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useItems } from "@/hooks/items/use-items-query";

const currency = (value: number | null) =>
  value === null ? "—" : `$${value.toFixed(2)}`;

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0] ?? "")
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);

export default function ItemsPage() {
  const { data, isLoading, error } = useItems();

  return (
    <PageState
      isLoading={isLoading}
      data={data}
      error={error}
      errorTitle="Failed to load items"
    >
      {(result) => (
        <div className="space-y-6">
          <PageHeader
            title="Items"
            description="Manage your product and inventory catalog."
            actions={
              <Button asChild className="rounded-2xl">
                <Link href="/items/new">
                  <Plus className="h-4 w-4" />
                  New item
                </Link>
              </Button>
            }
          />

          <div className="animate-fade-up stagger-1 overflow-hidden rounded-[24px] border border-border/60 bg-card shadow-[0_1px_2px_rgb(16_16_40/0.04),0_8px_24px_-12px_rgb(16_16_40/0.1)]">
            {result.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-shell w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-left text-muted-foreground">
                      <th className="px-5 py-3.5 font-semibold">Item</th>
                      <th className="px-4 py-3.5 font-semibold">Type</th>
                      <th className="px-4 py-3.5 font-semibold">Code</th>
                      <th className="px-4 py-3.5 font-semibold">Category</th>
                      <th className="px-4 py-3.5 font-semibold">Sale price</th>
                      <th className="px-5 py-3.5 font-semibold">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.items.map((item) => (
                      <ItemRow key={item.id} item={item} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={PackageIcon}
                title="No items yet"
                description="Create your first item to start building your catalog."
                actions={
                  <Button asChild variant="outline" className="rounded-2xl">
                    <Link href="/items/new">
                      <Plus className="h-4 w-4" />
                      New item
                    </Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>
      )}
    </PageState>
  );
}

function ItemRow({ item }: { item: ItemDto }) {
  const router = useRouter();
  const navigate = () => router.push(`/items/${item.id}`);

  return (
    <tr
      className="cursor-pointer transition-colors duration-150 hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:bg-primary/[0.06]"
      role="link"
      tabIndex={0}
      aria-label={`View ${item.name}`}
      onClick={navigate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate();
        }
      }}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/[0.14] to-primary/[0.05] text-xs font-bold text-primary">
            {initials(item.name)}
          </span>
          <span className="font-semibold tracking-tight">{item.name}</span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <Badge variant={item.itemType === "SERVICE" ? "secondary" : "default"}>
          {item.itemType}
        </Badge>
      </td>
      <td className="px-4 py-3.5 text-muted-foreground">
        {item.itemCode ?? "—"}
      </td>
      <td className="px-4 py-3.5 text-muted-foreground">
        {item.category?.name ?? "—"}
      </td>
      <td className="px-4 py-3.5 font-medium tabular-nums">
        {currency(item.salePriceExclTax)}
      </td>
      <td className="px-5 py-3.5 text-muted-foreground tabular-nums">
        {item.openingStock ?? "—"}
      </td>
    </tr>
  );
}
