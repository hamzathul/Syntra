"use client";

import { Loader2Icon, AlertCircleIcon } from "lucide-react";
import { useGeneralSettings } from "@/hooks/settings/use-general-settings-query";
import { TaxSettingsForm } from "@/components/settings/taxes/tax-settings-form";
import { Separator } from "@/components/ui/separator";

export default function TaxesSettingsPage() {
  const { data: settings, isLoading, isError, error } = useGeneralSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <AlertCircleIcon className="h-8 w-8 mb-2" />
        <p>Failed to load settings</p>
        <p className="text-sm">{(error as Error)?.message ?? "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Taxes &amp; GST</h1>
        <p className="text-muted-foreground">
          Manage tax rates, create tax groups, and configure supply settings
        </p>
      </div>

      <Separator />

      <div className="max-w-2xl">
        <TaxSettingsForm settings={settings} />
      </div>
    </div>
  );
}
