"use client";

import { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, Wallet } from "lucide-react";
import { getCurrencySymbol } from "shared";
import { PageState } from "@/components/ui/page-state";
import { PageHeader } from "@/components/ui/page-header";
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
          <PageHeader
            title="Cash"
            description="Track cash on hand, deposit to or withdraw from your banks."
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="animate-fade-up relative overflow-hidden rounded-[28px] border border-border/60 bg-card p-7 shadow-[0_1px_2px_rgb(16_16_40/0.04),0_16px_40px_-20px_rgb(16_16_40/0.25)]">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/[0.09] text-primary">
                      <Wallet className="h-4 w-4" />
                    </span>
                    Current cash balance
                  </div>
                  <p
                    className={`mt-3 text-[38px] font-semibold leading-none tracking-tight tabular-nums ${
                      data.balance < 0 ? "text-destructive" : ""
                    }`}
                  >
                    {currencySymbol}
                    {data.balance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                  </p>
                  <p className="mt-2 text-[13px] text-muted-foreground">
                    Money you currently have on hand
                  </p>
                </div>
              </div>

              <div className="animate-fade-up stagger-1 flex flex-wrap gap-2.5">
                <Button
                  className="rounded-2xl"
                  onClick={() => setAdjustOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Adjust cash
                </Button>
                <MoneyActionsPanel
                  banks={banks}
                  onNoBanks={() => setNoBanksOpen(true)}
                />
              </div>
            </div>

            <div className="animate-fade-up stagger-2 overflow-hidden rounded-[24px] border border-border/60 bg-card shadow-[0_1px_2px_rgb(16_16_40/0.04),0_8px_24px_-12px_rgb(16_16_40/0.1)]">
              <div className="border-b border-border/60 px-5 py-4">
                <h2 className="text-[15px] font-semibold tracking-tight">
                  Transactions
                </h2>
                <p className="text-xs text-muted-foreground">
                  Latest cash movements
                </p>
              </div>
              <div className="px-5 py-2">
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
