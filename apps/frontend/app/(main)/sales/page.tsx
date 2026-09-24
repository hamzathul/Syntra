"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Plus, ReceiptText } from "lucide-react";
import type { SaleDto } from "shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageState } from "@/components/ui/page-state";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SaleInvoiceDialog } from "@/components/sales/sale-invoice-dialog";
import { useSales } from "@/hooks/sales/use-sales-query";

const formatAmount = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function SalesPage() {
  const { data, isLoading, error } = useSales();
  const [previewSale, setPreviewSale] = useState<SaleDto | null>(null);

  return (
    <PageState
      isLoading={isLoading}
      data={data}
      error={error}
      errorTitle="Failed to load sales"
    >
      {(result) => (
        <div className="space-y-6">
          <SaleInvoiceDialog
            open={previewSale !== null}
            onOpenChange={(open) => {
              if (!open) setPreviewSale(null);
            }}
            sale={previewSale}
          />
          <PageHeader
            title="Sales"
            description="Manage and track every sale in one place."
            actions={
              <Button asChild className="rounded-2xl">
                <Link href="/sales/new">
                  <Plus className="h-4 w-4" />
                  New sale
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
                      <th className="px-5 py-3.5 font-semibold">#</th>
                      <th className="px-5 py-3.5 font-semibold">Date</th>
                      <th className="px-4 py-3.5 font-semibold">Customer</th>
                      <th className="px-4 py-3.5 font-semibold">Type</th>
                      <th className="px-4 py-3.5 text-right font-semibold">
                        Total
                      </th>
                      <th className="px-4 py-3.5 text-right font-semibold">
                        Received
                      </th>
                      <th className="px-4 py-3.5 text-right font-semibold">
                        Balance due
                      </th>
                      <th className="px-5 py-3.5 font-semibold">Status</th>
                      <th className="px-5 py-3.5 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.items.map((sale, index) => (
                      <SaleRow
                        key={sale.id}
                        sale={sale}
                        index={index}
                        onPreview={() => setPreviewSale(sale)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={ReceiptText}
                title="No sales yet"
                description="Create your first sale to start recording cash and credit transactions."
                actions={
                  <Button asChild variant="outline" className="rounded-2xl">
                    <Link href="/sales/new">
                      <Plus className="h-4 w-4" />
                      New sale
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

function SaleRow({
  sale,
  index,
  onPreview,
}: {
  sale: SaleDto;
  index: number;
  onPreview: () => void;
}) {
  const router = useRouter();
  const navigate = () => router.push(`/sales/${sale.id}`);

  return (
    <tr
      className="cursor-pointer transition-colors duration-150 hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:bg-primary/[0.06]"
      role="link"
      tabIndex={0}
      aria-label={`View sale for ${sale.partyName}`}
      onClick={navigate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate();
        }
      }}
    >
      <td className="px-5 py-3.5 text-muted-foreground tabular-nums">
        {index + 1}
      </td>
      <td className="px-5 py-3.5 font-semibold tabular-nums">
        {sale.saleDate.slice(0, 10)}
      </td>
      <td className="px-4 py-3.5">{sale.partyName}</td>
      <td className="px-4 py-3.5">
        <Badge variant={sale.saleType === "CREDIT" ? "secondary" : "default"}>
          {sale.saleType}
        </Badge>
      </td>
      <td className="px-4 py-3.5 text-right font-medium tabular-nums">
        {formatAmount(sale.totalAmount)}
      </td>
      <td className="px-4 py-3.5 text-right text-muted-foreground tabular-nums">
        {formatAmount(sale.receivedAmount)}
      </td>
      <td className="px-4 py-3.5 text-right tabular-nums">
        <span
          className={
            sale.balanceDue > 0
              ? "font-semibold text-destructive"
              : "text-muted-foreground"
          }
        >
          {formatAmount(sale.balanceDue)}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <Badge variant={sale.paid ? "success" : "warning"}>
          <span
            className={`h-1.5 w-1.5 rounded-full ${sale.paid ? "bg-emerald-500" : "bg-amber-500"}`}
          />
          {sale.paid ? "Paid" : "Due"}
        </Badge>
      </td>
      <td className="px-5 py-3.5 text-right">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={`View invoice for ${sale.partyName}`}
          onClick={(event) => {
            event.stopPropagation();
            onPreview();
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
