"use client";

import { useGeneralSettings } from "@/hooks/settings/use-general-settings-query";
import { TaxSettingsForm } from "@/components/settings/taxes/tax-settings-form";
import { PageState } from "@/components/ui/page-state";
import { Separator } from "@/components/ui/separator";

export default function TaxesSettingsPage() {
  const { data: settings, isLoading, error } = useGeneralSettings();

  return (
    <PageState
      isLoading={isLoading}
      data={settings}
      error={error}
      errorTitle="Failed to load settings"
    >
      {(data) => (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Taxes &amp; GST
            </h1>
            <p className="text-muted-foreground">
              Manage tax rates, create tax groups, and configure supply settings
            </p>
          </div>

          <Separator />

          <div className="max-w-2xl">
            <TaxSettingsForm settings={data} />
          </div>
        </div>
      )}
    </PageState>
  );
}
