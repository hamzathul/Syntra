"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import { CameraIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { readImageFileAsDataUrl } from "@/lib/file-utils";
import { toast } from "sonner";

interface LogoUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  size?: number;
}

export function LogoUpload({ value, onChange, size = 96 }: LogoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleClick = () => fileRef.current?.click();

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await readImageFileAsDataUrl(file);
        onChange(dataUrl);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to upload image",
        );
      }
      e.target.value = "";
    },
    [onChange],
  );

  const initials = "BS";

  return (
    <div className="relative inline-block">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={handleClick}
        className="group relative overflow-hidden rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        style={{ width: size, height: size }}
      >
        {value ? (
          <Image
            src={value}
            alt="Company logo"
            width={size}
            height={size}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {initials}
          </div>
        )}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full",
            "bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity",
          )}
        >
          <CameraIcon className="h-6 w-6 text-white" />
        </div>
      </button>
    </div>
  );
}
