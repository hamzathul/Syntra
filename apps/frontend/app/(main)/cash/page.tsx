"use client";

import { useState } from "react";
import Link from "next/link";
import { WalletIcon, SlidersHorizontal } from "lucide-react";
import { getCurrencySymbol } from "shared";
import { PageState } from "@/components/ui/page-state";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CashTransactions } from "@/components/money/cash-transactions";
import { AdjustCashDialog } from "@/components/money/adjust-cash-dialog";
import { MoneyActionsPanel } from "@/components/money/money-actions-panel";
import { useCashSummary } from "@/hooks/money/use-money-query";
import { useBanks } from "@/hooks/settings/use-bank-settings-query";
import { useGeneralSettings } from "@/hooks/settings/use-general-settings-query";

export default function CashPage() {
  const { data: summary, isLoading, error } = useCashSummary();
  const { data: banks = [] } = useBanks();
  const { data: settings } = useGeneralSettings();

  const currencySymbol = getCurrencySymbol(settings?.businessCurrency ?? "INR");

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [noBanksOpen, setNoBanksOpen] = useState(false);

  return (
    <PageState
      isLoading={isLoading}
      data={summary}
      error={error}
      errorTitle="Failed to load cash summary"
    >
      {(data) => (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cash</h1>
            <p className="text-muted-foreground">
              Track cash on hand, deposit to or withdraw from your banks
            </p>
          </div>

          <Separator />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-transparent p-6">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <WalletIcon className="h-4 w-4" />
                  Current Cash Balance
                </div>
                <p
                  className={`mt-2 text-4xl font-bold tracking-tight tabular-nums ${
                    data.balance < 0 ? "text-destructive" : ""
                  }`}
                >
                  {currencySymbol}
                  {data.balance.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Money you currently have on hand
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button className="gap-2" onClick={() => setAdjustOpen(true)}>
                  <SlidersHorizontal className="h-4 w-4" />
                  Adjust Cash
                </Button>
                <MoneyActionsPanel
                  banks={banks}
                  onNoBanks={() => setNoBanksOpen(true)}
                />
              </div>
            </div>

            <div className="rounded-xl border">
              <div className="border-b px-4 py-3">
                <h2 className="text-sm font-semibold">Transactions</h2>
              </div>
              <div className="px-4">
                <CashTransactions
                  adjustments={data.adjustments}
                  transfers={data.transfers}
                  salePayments={data.salePayments}
                  banks={banks}
                  currencySymbol={currencySymbol}
                />
              </div>
            </div>
          </div>

          <AdjustCashDialog open={adjustOpen} onOpenChange={setAdjustOpen} />

          <Dialog open={noBanksOpen} onOpenChange={setNoBanksOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>No bank accounts yet</DialogTitle>
                <DialogDescription>
                  Add a bank account first so you can deposit or withdraw cash.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNoBanksOpen(false)}>
                  Close
                </Button>
                <Button asChild>
                  <Link href="/banks">Go to Banks</Link>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </PageState>
  );
}