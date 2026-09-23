"use client";

import { AlertCircleIcon } from "lucide-react";

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
      <div
        className="space-y-4 animate-fade-up"
        role="status"
        aria-label="Loading"
      >
        <div className="flex flex-col gap-2">
          <div className="skeleton-shimmer h-8 w-48 rounded-xl" />
          <div className="skeleton-shimmer h-4 w-72 rounded-lg opacity-70" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[20px] border border-border/70 bg-card p-5"
            >
              <div className="skeleton-shimmer h-4 w-24 rounded-lg" />
              <div className="skeleton-shimmer mt-3 h-7 w-20 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="rounded-[20px] border border-border/70 bg-card p-6">
          <div className="skeleton-shimmer h-4 w-full rounded-lg" />
          <div className="skeleton-shimmer mt-2 h-4 w-11/12 rounded-lg opacity-80" />
          <div className="skeleton-shimmer mt-2 h-4 w-2/3 rounded-lg opacity-60" />
        </div>
      </div>
    );
  }

  if (data === undefined || data === null) {
    return (
      <div className="animate-scale-in mx-auto flex max-w-md flex-col items-center justify-center rounded-[24px] border border-border/70 bg-card px-8 py-14 text-center shadow-[0_1px_2px_rgb(16_16_40/0.04),0_8px_24px_-12px_rgb(16_16_40/0.1)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircleIcon className="h-6 w-6 text-destructive" />
        </div>
        <p className="mt-4 text-[15px] font-semibold tracking-tight">
          {errorTitle ?? "Something went wrong"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {(error as Error)?.message ?? "Please try again in a moment."}
        </p>
      </div>
    );
  }

  return <>{children(data)}</>;
}
