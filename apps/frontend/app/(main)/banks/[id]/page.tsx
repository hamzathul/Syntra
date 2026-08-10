"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  LandmarkIcon,
  Loader2Icon,
  PencilIcon,
  PrinterIcon,
  QrCodeIcon,
} from "lucide-react";
import { getCurrencySymbol } from "shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageState } from "@/components/ui/page-state";
import { BankFormDialog } from "@/components/banks/bank-form-dialog";
import { BankTransactions } from "@/components/banks/bank-transactions";
import { MoneyActionsPanel } from "@/components/money/money-actions-panel";
import { useBanks } from "@/hooks/settings/use-bank-settings-query";
import { useGeneralSettings } from "@/hooks/settings/use-general-settings-query";
import { useBankHistory } from "@/hooks/money/use-money-query";

export default function BankDetailPage() {
  const params = useParams<{ id: string }>();
  const {
    data: history,
    isLoading,
    error,
  } = useBankHistory(params.id);
  const { data: banks = [] } = useBanks();
  const { data: settings } = useGeneralSettings();

  const bank = banks.find((b) => b.id === params.id);
  const currencySymbol = getCurrencySymbol(settings?.businessCurrency ?? "INR");

  const [editOpen, setEditOpen] = useState(false);

  const handleSaved = useCallback(() => {
    setEditOpen(false);
  }, []);

  return (
    <PageState
      isLoading={isLoading}
      data={history}
      error={error}
      errorTitle="Failed to load bank history"
    >
      {(data) => (
        <div className="space-y-6">
          <Link
            href="/banks"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Banks
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {bank?.name ?? params.id}
                </h1>
                {bank?.printBankDetails && (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <PrinterIcon className="h-3 w-3" />
                    Bank Details
                  </Badge>
                )}
                {bank?.printUpiQr && (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <QrCodeIcon className="h-3 w-3" />
                    UPI QR
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {bank?.branchName ? `${bank.branchName} · ` : ""}
                {bank?.accountNumber ? `Account ${bank.accountNumber}` : "Bank account"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <MoneyActionsPanel
                banks={banks}
                label="Deposit / Withdraw"
                defaultBankId={params.id}
              />
              <Button variant="outline" className="gap-2" onClick={() => setEditOpen(true)}>
                <PencilIcon className="h-4 w-4" />
                Edit Bank
              </Button>
            </div>
          </div>

          <Separator />

          <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-transparent p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <LandmarkIcon className="h-4 w-4" />
              Current Balance
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
              {bank?.openingBalance !== null && bank?.openingBalance !== undefined
                ? `Opening balance ${currencySymbol}${bank.openingBalance.toLocaleString("en-IN")}`
                : "No opening balance recorded"}
            </p>
          </div>

          <div className="rounded-xl border">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Transactions</h2>
            </div>
            <div className="px-4">
              {bank ? (
                <BankTransactions
                  bankId={params.id}
                  bankName={bank.name}
                  history={data}
                  banks={banks}
                  currencySymbol={currencySymbol}
                />
              ) : (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2Icon className="h-5 w-5 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {bank && (
            <BankFormDialog
              open={editOpen}
              onOpenChange={setEditOpen}
              bank={bank}
              onSaved={handleSaved}
            />
          )}
        </div>
      )}
    </PageState>
  );
}