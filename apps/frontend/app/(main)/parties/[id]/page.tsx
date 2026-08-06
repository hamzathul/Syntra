"use client";

import { useParams } from "next/navigation";
import { useParty } from "@/hooks/parties/use-parties-query";
import { PageState } from "@/components/ui/page-state";
import { PartyForm } from "@/components/parties/party-form";

export default function EditPartyPage() {
  const params = useParams<{ id: string }>();
  const { data: party, isLoading, error } = useParty(params.id);

  return (
    <PageState
      isLoading={isLoading}
      data={party}
      error={error}
      errorTitle="Failed to load party"
    >
      {(data) => (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
            <p className="text-muted-foreground">
              Edit party details and address
            </p>
          </div>

          <PartyForm party={data} />
        </div>
      )}
    </PageState>
  );
}