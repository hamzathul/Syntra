"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readImageFileAsDataUrl } from "@/lib/file-utils";
import { toast } from "sonner";

interface ItemImageUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function ItemImageUpload({ value, onChange }: ItemImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="flex items-center gap-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {value ? (
        <div className="relative h-24 w-24 overflow-hidden rounded-lg border bg-muted">
          <Image
            src={value}
            alt="Item image"
            fill
            className="object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-1 top-1 rounded-full bg-background p-1 shadow"
            aria-label="Remove image"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed bg-muted/40">
          <ImagePlusIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileRef.current?.click()}
      >
        {value ? "Replace" : "Upload"}
      </Button>
    </div>
  );
}
