"use client";

import { useGeneralSettings } from "@/hooks/settings/use-general-settings-query";
import { TaxSettingsForm } from "@/components/settings/taxes/tax-settings-form";
import { PageState } from "@/components/ui/page-state";

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
        <div className="max-w-2xl">
          <TaxSettingsForm settings={data} />
        </div>
      )}
    </PageState>
  );
}
