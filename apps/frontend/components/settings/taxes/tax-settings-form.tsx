"use client";

import { useState, useCallback, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { GeneralSettingsDto } from "shared";
import { useUpdateGeneralSettingsMutation } from "@/hooks/settings/use-general-settings-query";
import { TaxRatesTab } from "./tax-rates-tab";
import { TaxGroupsTab } from "./tax-groups-tab";
import { toast } from "sonner";

interface TaxSettingsFormProps {
  settings: GeneralSettingsDto;
}

export function TaxSettingsForm({ settings }: TaxSettingsFormProps) {
  const updateGeneralMutation = useUpdateGeneralSettingsMutation();
  const [activeTab, setActiveTab] = useState<"rates" | "groups">("rates");
  const [stateOfSupply, setStateOfSupply] = useState(
    settings.stateOfSupplyEnabled,
  );

  useEffect(() => {
    setStateOfSupply(settings.stateOfSupplyEnabled);
  }, [settings.stateOfSupplyEnabled]);

  const handleToggle = useCallback(
    async (checked: boolean) => {
      setStateOfSupply(checked);
      try {
        await updateGeneralMutation.mutateAsync({
          stateOfSupplyEnabled: checked,
        });
        toast.success("State of Supply " + (checked ? "enabled" : "disabled"));
      } catch {
        setStateOfSupply(!checked);
        toast.error("Failed to update State of Supply setting");
      }
    },
    [updateGeneralMutation],
  );

  const tabClass = (tab: "rates" | "groups") =>
    `px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
      activeTab === tab
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
          <Label htmlFor="state-of-supply" className="text-sm font-medium">
            State of Supply
          </Label>
          <p className="text-xs text-muted-foreground">
            Enable or disable state-level supply tax configuration
          </p>
        </div>
        <Switch
          id="state-of-supply"
          checked={stateOfSupply}
          onCheckedChange={handleToggle}
        />
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-3">Tax List</h3>
        <div className="flex gap-0 border-b">
          <Button
            type="button"
            variant="ghost"
            className={tabClass("rates")}
            onClick={() => setActiveTab("rates")}
          >
            Tax Rates
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={tabClass("groups")}
            onClick={() => setActiveTab("groups")}
          >
            Tax Groups
          </Button>
        </div>
        <div className="pt-4">
          {activeTab === "rates" ? <TaxRatesTab /> : <TaxGroupsTab />}
        </div>
      </div>
    </div>
  );
}
