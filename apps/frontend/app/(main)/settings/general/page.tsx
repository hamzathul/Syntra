"use client";

import { useGeneralSettings } from "@/hooks/settings/use-general-settings-query";
import { GeneralSettingsForm } from "@/components/settings/general/general-settings-form";
import { PageState } from "@/components/ui/page-state";
import { Separator } from "@/components/ui/separator";

export default function GeneralSettingsPage() {
  const { data: settings, isLoading, error } = useGeneralSettings();

  return (
    <PageState
      isLoading={isLoading}
      data={settings}
      error={error}
      errorTitle="Failed to load general settings"
    >
      {(data) => (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
            <p className="text-muted-foreground">
              Configure business currency, decimal places, and date format for your company
            </p>
          </div>

          <Separator />

          <div className="max-w-lg">
            <GeneralSettingsForm settings={data} />
          </div>
        </div>
      )}
    </PageState>
  );
}
