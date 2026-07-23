"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import { Loader2Icon, AlertCircleIcon, DownloadIcon } from "lucide-react";
import { useCompanyProfile } from "@/hooks/settings/use-company-profile-query";
import { CompanyProfileForm } from "@/components/settings/company-profile/company-profile-form";
import { BusinessCard } from "@/components/settings/company-profile/business-card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { CompanyProfileDto } from "shared";

export default function CompanyProfilePage() {
  const { data: profile, isLoading, isError, error } = useCompanyProfile();
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [liveValues, setLiveValues] = useState<Record<string, string | string[]> | null>(null);

  const cardProfile = useMemo(() => {
    if (!liveValues || !profile) return profile;

    const merged: CompanyProfileDto = {
      ...profile,
      name: (liveValues.name as string) || profile.name,
      gstin: (liveValues.gstin as string) || null,
      phone1: (liveValues.phone1 as string) || null,
      phone2: (liveValues.phone2 as string) || null,
      email: (liveValues.email as string) || null,
      address: (liveValues.address as string) || null,
      pincode: (liveValues.pincode as string) || null,
      state: (liveValues.state as string) || null,
      businessType: liveValues.businessType === "__other__"
        ? (liveValues.otherBusinessType as string) || null
        : ((liveValues.businessType as string) || null),
      businessCategory: (liveValues.businessCategory as string) || null,
      logo: (liveValues.logo as string) || null,
      signature: (liveValues.signature as string) || null,
      showOnCard: (liveValues.showOnCard as string[]) ?? [],
    };

    return merged;
  }, [liveValues, profile]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 3,
        style: {
          padding: "0",
        },
      });
      const link = document.createElement("a");
      link.download = "business-card.png";
      link.href = dataUrl;
      link.click();
      toast.success("Card downloaded");
    } catch {
      toast.error("Failed to generate card image");
    } finally {
      setDownloading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <AlertCircleIcon className="h-8 w-8 mb-2" />
        <p>Failed to load company profile</p>
        <p className="text-sm">{(error as Error)?.message ?? "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
        <p className="text-muted-foreground">
          Manage your business information and create a digital business card
        </p>
      </div>

      <Separator />

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Form */}
        <div>
          <CompanyProfileForm profile={profile} onLiveValuesChange={setLiveValues} />
        </div>

        {/* Card Preview */}
        <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Card Preview</h2>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <DownloadIcon className="h-4 w-4" />
              )}
              {downloading ? "Downloading..." : "Download"}
            </Button>
          </div>

          <BusinessCard ref={cardRef} profile={cardProfile ?? profile} />

          <p className="text-xs text-center text-muted-foreground">
            Toggle &quot;Show on card&quot; switches in the form to customize what appears here.
          </p>
        </div>
      </div>
    </div>
  );
}
