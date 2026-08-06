"use client";

import { PartyForm } from "@/components/parties/party-form";

export default function NewPartyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Party</h1>
        <p className="text-muted-foreground">
          Add a customer or supplier to your parties list
        </p>
      </div>

      <PartyForm />
    </div>
  );
}