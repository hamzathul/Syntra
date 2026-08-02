"use client";

import { Loader2Icon, AlertCircleIcon } from "lucide-react";

interface PageStateProps<T> {
  readonly isLoading: boolean;
  readonly data?: T | undefined;
  readonly error?: unknown;
  readonly errorTitle?: string;
  readonly children: (data: T) => React.ReactNode;
}

export function PageState<T>({
  isLoading,
  data,
  error,
  errorTitle,
  children,
}: PageStateProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (data === undefined || data === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <AlertCircleIcon className="h-8 w-8 mb-2" />
        <p>{errorTitle ?? "Failed to load data"}</p>
        <p className="text-sm">{(error as Error)?.message ?? "Unknown error"}</p>
      </div>
    );
  }

  return <>{children(data)}</>;
}
