"use client";

import { useCallback, useRef, useState } from "react";
import { FileTextIcon, Loader2Icon, XIcon } from "lucide-react";
import { readFileAsDataUrl } from "@/lib/file-utils";

interface DocumentUploadFieldProps {
  readonly value: string | undefined;
  readonly onChange: (value: string | undefined) => void;
  readonly label?: string;
}

export function DocumentUploadField({
  value,
  onChange,
  label = "Document",
}: DocumentUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setError(null);
      setLoading(true);
      try {
        const dataUrl = await readFileAsDataUrl(file);
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
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate text-sm">Document attached</span>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Remove document"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <FileTextIcon className="h-4 w-4" />
          )}
          {loading ? "Reading document..." : "Upload document"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <p className="text-xs text-muted-foreground">
        PDF, Word, Excel, etc. up to 2 MB
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
