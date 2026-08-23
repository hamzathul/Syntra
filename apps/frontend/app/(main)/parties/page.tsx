"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusIcon, UsersIcon } from "lucide-react";
import type { PartyDto } from "shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageState } from "@/components/ui/page-state";
import { useParties } from "@/hooks/parties/use-parties-query";

const currency = (value: number | null) =>
  value === null ? "—" : `$${value.toFixed(2)}`;

export default function PartiesPage() {
  const { data, isLoading, error } = useParties();

  return (
    <PageState
      isLoading={isLoading}
      data={data}
      error={error}
      errorTitle="Failed to load parties"
    >
      {(result) => (
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Parties</h1>
              <p className="text-muted-foreground">
                Manage your customers and suppliers
              </p>
            </div>
            <Button asChild className="gap-1">
              <Link href="/parties/new">
                <PlusIcon className="h-4 w-4" />
                New Party
              </Link>
            </Button>
          </div>

          <div className="border rounded-xl overflow-hidden">
            {result.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Party</th>
                      <th className="px-4 py-3 font-medium">Contact</th>
                      <th className="px-4 py-3 font-medium">Opening Balance</th>
                      <th className="px-4 py-3 font-medium">Credit Limit</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {result.items.map((party) => (
                      <PartyRow key={party.id} party={party} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <UsersIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">No parties yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first party to start managing customers and
                    suppliers.
                  </p>
                </div>
                <Button asChild variant="outline" className="gap-1">
                  <Link href="/parties/new">
                    <PlusIcon className="h-4 w-4" />
                    New Party
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

function PartyRow({ party }: { party: PartyDto }) {
  const router = useRouter();

  const openingBalanceLabel =
    party.openingBalanceAmount === null
      ? "—"
      : `${currency(party.openingBalanceAmount)} ${
          party.openingBalanceType === "TO_PAY"
            ? "(to pay)"
            : party.openingBalanceType === "TO_RECEIVE"
              ? "(to receive)"
              : ""
        }`;

  return (
    <tr
      className="cursor-pointer transition-colors hover:bg-muted/30"
      onClick={() => router.push(`/parties/${party.id}`)}
    >
      <td className="px-4 py-3 font-medium">{party.name}</td>
      <td className="px-4 py-3 text-muted-foreground">
        {party.contactNumber ?? "—"}
      </td>
      <td className="px-4 py-3">
        {party.openingBalanceType ? (
          <Badge variant="outline">{openingBalanceLabel}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3">{currency(party.creditLimit)}</td>
      <td className="px-4 py-3 text-muted-foreground">{party.email ?? "—"}</td>
    </tr>
  );
}