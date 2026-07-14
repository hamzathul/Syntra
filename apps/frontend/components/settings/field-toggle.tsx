"use client";

import type { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FieldToggleProps {
  id: string;
  label: string;
  showOnCard?: boolean;
  onToggleShow?: (show: boolean) => void;
  children: ReactNode;
}

export function FieldToggle({
  id,
  label,
  showOnCard,
  onToggleShow,
  children,
}: FieldToggleProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {onToggleShow !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Show on card</span>
            <Switch
              id={`${id}-show`}
              checked={showOnCard ?? false}
              onCheckedChange={onToggleShow}
            />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
