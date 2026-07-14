"use client";

import { useRef } from "react";
import Image from "next/image";
import { CameraIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  size?: number;
}

export function LogoUpload({ value, onChange, size = 96 }: LogoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleClick = () => fileRef.current?.click();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 500_000) {
      alert("Image too large. Maximum 500KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

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
        <div className={cn(
          "absolute inset-0 flex items-center justify-center rounded-full",
          "bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity",
        )}>
          <CameraIcon className="h-6 w-6 text-white" />
        </div>
      </button>
    </div>
  );
}
