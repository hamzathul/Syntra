"use client";

import { useCallback, useRef, useState } from "react";
import { ImageIcon, Loader2Icon, XIcon } from "lucide-react";
import { readImageFileAsDataUrl } from "@/lib/file-utils";

interface ImageUploadFieldProps {
  readonly value: string | undefined;
  readonly onChange: (value: string | undefined) => void;
  readonly label?: string;
}

export function ImageUploadField({
  value,
  onChange,
  label = "Attachment",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setError(null);
      setLoading(true);
      try {
        const dataUrl = await readImageFileAsDataUrl(file);
        onChange(dataUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to read file");
      } finally {
        setLoading(false);
      }
    },
    [onChange],
  );

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{label}</span>
        {value && (
          <span className="text-xs text-muted-foreground">(optional)</span>
        )}
      </div>

      {value ? (
        <div className="relative w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Attachment preview"
            className="h-24 w-24 rounded-lg border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground transition-colors"
            aria-label="Remove image"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex h-16 w-full items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
          {loading ? "Reading image..." : "Upload image"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <p className="text-xs text-muted-foreground">
        JPG, PNG, etc. up to 500 KB
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}