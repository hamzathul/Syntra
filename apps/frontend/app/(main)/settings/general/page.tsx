"use client";

import { useGeneralSettings } from "@/hooks/settings/use-general-settings-query";
import { GeneralSettingsForm } from "@/components/settings/general/general-settings-form";
import { PageState } from "@/components/ui/page-state";

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
        <div className="max-w-lg">
          <GeneralSettingsForm settings={data} />
        </div>
      )}
    </PageState>
  );
}
