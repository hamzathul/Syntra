"use client";

import { useState, useCallback, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TabNav } from "@/components/ui/tab-nav";
import type { GeneralSettingsDto } from "shared";
import { useUpdateGeneralSettingsMutation } from "@/hooks/settings/use-general-settings-query";
import { TaxRatesTab } from "./tax-rates-tab";
import { TaxGroupsTab } from "./tax-groups-tab";
import { toast } from "sonner";

interface TaxSettingsFormProps {
  settings: GeneralSettingsDto;
}

const TABS = [
  { id: "rates", label: "Tax rates" },
  { id: "groups", label: "Tax groups" },
] as const;

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
        <TabNav tabs={TABS} value={activeTab} onChange={setActiveTab} />
        <div className="pt-4">
          {activeTab === "rates" ? <TaxRatesTab /> : <TaxGroupsTab />}
        </div>
      </div>
    </div>
  );
}
