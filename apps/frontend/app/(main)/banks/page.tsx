"use client";

import { Separator } from "@/components/ui/separator";
import { BankAccountsSection } from "@/components/banks/bank-accounts-section";

export default function BanksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Banks</h1>
        <p className="text-muted-foreground">
          Manage bank accounts and how they appear on your invoices
        </p>
      </div>

      <Separator />

      <BankAccountsSection />
    </div>
  );
}