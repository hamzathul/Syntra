"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { PhoneIcon, MailIcon, MapPinIcon, FileTextIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyProfileDto } from "shared";

interface BusinessCardProps {
  profile: CompanyProfileDto;
  className?: string;
}

export const BusinessCard = forwardRef<HTMLDivElement, BusinessCardProps>(
  function BusinessCard({ profile, className }, ref) {
    const showOnCard = profile.showOnCard ?? [];
    const hasGstin = profile.gstin && showOnCard.includes("gstin");
    const hasPhone1 = profile.phone1 && showOnCard.includes("phone1");
    const hasPhone2 = profile.phone2 && showOnCard.includes("phone2");
    const hasEmail = profile.email && showOnCard.includes("email");
    const hasAddress = profile.address && showOnCard.includes("address");
    const hasPincode = profile.pincode && showOnCard.includes("pincode");
    const hasState = profile.state && showOnCard.includes("state");
    const hasBizType = profile.businessType && showOnCard.includes("businessType");
    const hasFields = hasGstin || hasPhone1 || hasPhone2 || hasEmail || hasAddress || hasPincode || hasState || hasBizType;

    return (
      <div ref={ref} className={cn("w-full", className)}>
        <div className="relative flex overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
          {/* Left accent bar */}
          <div className="w-2 shrink-0 bg-linear-to-b from-primary via-primary/80 to-primary/60" />

          <div className="flex flex-1 flex-col gap-5 p-5">
            {/* Logo + Name row */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/60 text-xl font-bold text-white shadow-sm overflow-hidden">
                {profile.logo ? (
                  <Image
                    src={profile.logo}
                    alt=""
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-gray-900 truncate leading-tight">
                  {profile.name || "Business Name"}
                </h3>
                {hasBizType && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {profile.businessType}
                  </p>
                )}
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-2.5">
              {hasGstin && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/5">
                    <FileTextIcon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="font-mono text-xs tracking-wider text-gray-600">
                    {profile.gstin}
                  </span>
                </div>
              )}

              {hasPhone1 && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/5">
                    <PhoneIcon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-gray-600">
                    {profile.phone1}
                  </span>
                </div>
              )}

              {hasPhone2 && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/5">
                    <PhoneIcon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-gray-600">
                    {profile.phone2}
                  </span>
                </div>
              )}

              {hasEmail && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/5">
                    <MailIcon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-gray-600">{profile.email}</span>
                </div>
              )}

              {/* Address block - combines address, pincode, state */}
              {(hasAddress || hasPincode || hasState) && (
                <div className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/5">
                    <MapPinIcon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-gray-600 leading-snug">
                    {[profile.address, profile.pincode, profile.state]
                      .filter((x): x is string => !!x)
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>

            {/* Signature */}
            {profile.signature && (
              <div className="border-t border-gray-100 pt-3">
                <Image
                  src={profile.signature}
                  alt="Signature"
                  width={160}
                  height={32}
                  className="h-8 object-contain"
                  unoptimized
                />
              </div>
            )}

            {!hasFields && !profile.signature && (
              <p className="text-sm text-gray-400 italic text-center py-4">
                No fields enabled for display
              </p>
            )}
          </div>
        </div>
      </div>
    );
  },
);
