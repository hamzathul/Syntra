"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusIcon, ReceiptIcon } from "lucide-react";
import type { SaleDto } from "shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageState } from "@/components/ui/page-state";
import { useSales } from "@/hooks/sales/use-sales-query";

const formatAmount = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function SalesPage() {
  const { data, isLoading, error } = useSales();

  return (
    <PageState
      isLoading={isLoading}
      data={data}
      error={error}
      errorTitle="Failed to load sales"
    >
      {(result) => (
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
              <p className="text-muted-foreground">
                Manage and track all sales
              </p>
            </div>
            <Button asChild className="gap-1">
              <Link href="/sales/new">
                <PlusIcon className="h-4 w-4" />
                New Sale
              </Link>
            </Button>
          </div>

          <div className="border rounded-xl overflow-hidden">
            {result.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium text-right">Total</th>
                      <th className="px-4 py-3 font-medium text-right">
                        Received
                      </th>
                      <th className="px-4 py-3 font-medium text-right">
                        Balance Due
                      </th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {result.items.map((sale) => (
                      <SaleRow key={sale.id} sale={sale} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <ReceiptIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">No sales yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first sale to start recording cash and credit
                    transactions.
                  </p>
                </div>
                <Button asChild variant="outline" className="gap-1">
                  <Link href="/sales/new">
                    <PlusIcon className="h-4 w-4" />
                    New Sale
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

function SaleRow({ sale }: { sale: SaleDto }) {
  const router = useRouter();
  const navigate = () => router.push(`/sales/${sale.id}`);

  return (
    <tr
      className="cursor-pointer transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:bg-muted/40"
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
      <td className="px-4 py-3 font-medium">{sale.saleDate.slice(0, 10)}</td>
      <td className="px-4 py-3">{sale.partyName}</td>
      <td className="px-4 py-3">
        <Badge variant={sale.saleType === "CREDIT" ? "secondary" : "outline"}>
          {sale.saleType}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right">{formatAmount(sale.totalAmount)}</td>
      <td className="px-4 py-3 text-right text-muted-foreground">
        {formatAmount(sale.receivedAmount)}
      </td>
      <td className="px-4 py-3 text-right">
        <span
          className={
            sale.balanceDue > 0 ? "font-medium text-destructive" : undefined
          }
        >
          {formatAmount(sale.balanceDue)}
        </span>
      </td>
      <td className="px-4 py-3">
        <Badge variant={sale.paid ? "outline" : "destructive"}>
          {sale.paid ? "Paid" : "Due"}
        </Badge>
      </td>
    </tr>
  );
}
