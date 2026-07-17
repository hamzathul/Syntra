"use client";

import { Loader2Icon, AlertCircleIcon } from "lucide-react";
import { useGeneralSettings } from "@/hooks/use-general-settings-query";
import { GeneralSettingsForm } from "@/components/settings/general-settings-form";
import { Separator } from "@/components/ui/separator";

export default function GeneralSettingsPage() {
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
        <p>Failed to load general settings</p>
        <p className="text-sm">{(error as Error)?.message ?? "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
        <p className="text-muted-foreground">
          Configure business currency, decimal places, and date format for your company
        </p>
      </div>

      <Separator />

      <div className="max-w-lg">
        <GeneralSettingsForm settings={settings} />
      </div>
    </div>
  );
}
