"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import type { PartyDto } from "shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageState } from "@/components/ui/page-state";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useParties } from "@/hooks/parties/use-parties-query";

const currency = (value: number | null) =>
  value === null ? "—" : `$${value.toFixed(2)}`;

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0] ?? "")
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
          <PageHeader
            title="Parties"
            description="Manage your customers and suppliers."
            actions={
              <Button asChild className="rounded-2xl">
                <Link href="/parties/new">
                  <Plus className="h-4 w-4" />
                  New party
                </Link>
              </Button>
            }
          />

          <div className="animate-fade-up stagger-1 overflow-hidden rounded-[24px] border border-border/60 bg-card shadow-[0_1px_2px_rgb(16_16_40/0.04),0_8px_24px_-12px_rgb(16_16_40/0.1)]">
            {result.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-shell w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-left text-muted-foreground">
                      <th className="px-5 py-3.5 font-semibold">Party</th>
                      <th className="px-4 py-3.5 font-semibold">Contact</th>
                      <th className="px-4 py-3.5 font-semibold">
                        Opening balance
                      </th>
                      <th className="px-4 py-3.5 font-semibold">
                        Credit limit
                      </th>
                      <th className="px-5 py-3.5 font-semibold">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.items.map((party) => (
                      <PartyRow key={party.id} party={party} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="No parties yet"
                description="Create your first party to start managing customers and suppliers."
                actions={
                  <Button asChild variant="outline" className="rounded-2xl">
                    <Link href="/parties/new">
                      <Plus className="h-4 w-4" />
                      New party
                    </Link>
                  </Button>
                }
              />
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

  const navigate = () => router.push(`/parties/${party.id}`);

  return (
    <tr
      className="cursor-pointer transition-colors duration-150 hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:bg-primary/[0.06]"
      role="link"
      tabIndex={0}
      aria-label={`View ${party.name}`}
      onClick={navigate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate();
        }
      }}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/[0.16] to-primary/[0.05] text-xs font-bold text-primary">
            {initials(party.name)}
          </span>
          <span className="font-semibold tracking-tight">{party.name}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 text-muted-foreground">
        {party.contactNumber ?? "—"}
      </td>
      <td className="px-4 py-3.5">
        {party.openingBalanceType ? (
          <Badge variant="outline">{openingBalanceLabel}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3.5 tabular-nums">
        {currency(party.creditLimit)}
      </td>
      <td className="px-5 py-3.5 text-muted-foreground">
        {party.email ?? "—"}
      </td>
    </tr>
  );
}
