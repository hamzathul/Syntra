"use client";

import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type MoneyAction = "TO_BANK" | "FROM_BANK" | "BETWEEN_BANKS" | "ADJUST";

interface MoneyActionMenuProps {
  readonly onSelect: (action: MoneyAction) => void;
  readonly label?: string;
}

const items: Array<{
  value: MoneyAction;
  label: string;
  description: string;
  icon: typeof ArrowDownToLine;
}> = [
  {
    value: "BETWEEN_BANKS",
    label: "Bank to Bank Transfer",
    description: "Move money between two bank accounts",
    icon: ArrowLeftRight,
  },
  {
    value: "FROM_BANK",
    label: "Bank to Cash Transfer",
    description: "Move money from bank to your cash balance",
    icon: ArrowDownToLine,
  },
  {
    value: "TO_BANK",
    label: "Cash to Bank Transfer",
    description: "Move cash into a bank account",
    icon: ArrowUpFromLine,
  },
  {
    value: "ADJUST",
    label: "Adjust Bank Balance",
    description: "Record a one-time increase or decrease",
    icon: SlidersHorizontal,
  },
];

export function MoneyActionMenu({
  onSelect,
  label = "Deposit / Withdraw",
}: MoneyActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          {label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onSelect={() => onSelect(item.value)}
            className="gap-3 py-2.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <item.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}