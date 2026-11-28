"use client";

import { PartyForm } from "@/components/parties/party-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewPartyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New party"
        description="Add a customer or supplier to your parties list."
      />

      <PartyForm />
    </div>
  );
}
