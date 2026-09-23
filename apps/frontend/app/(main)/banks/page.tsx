"use client";

import { PageHeader } from "@/components/ui/page-header";
import { BankAccountsSection } from "@/components/banks/bank-accounts-section";

export default function BanksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Banks"
        description="Manage bank accounts and how they appear on your invoices."
      />
      <div className="animate-fade-up stagger-1">
        <BankAccountsSection />
      </div>
    </div>
  );
}
