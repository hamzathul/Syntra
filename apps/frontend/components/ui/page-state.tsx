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
        className="animate-page-in space-y-5"
        role="status"
        aria-label="Loading"
      >
        <div className="flex flex-col gap-2">
          <div className="skeleton-shimmer h-7 w-40 rounded-lg" />
          <div className="skeleton-shimmer h-3.5 w-64 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-border/80 bg-card p-4"
            >
              <div className="skeleton-shimmer h-3.5 w-20 rounded" />
              <div className="skeleton-shimmer mt-3 h-6 w-16 rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-5">
          <div className="skeleton-shimmer h-3.5 w-full rounded" />
          <div className="skeleton-shimmer mt-2 h-3.5 w-11/12 rounded opacity-80" />
          <div className="skeleton-shimmer mt-2 h-3.5 w-2/3 rounded opacity-60" />
        </div>
      </div>
    );
  }

  if (data === undefined || data === null) {
    return (
      <div className="animate-scale-in mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border border-border/80 bg-card px-8 py-12 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10">
          <AlertCircleIcon className="h-5 w-5 text-destructive" />
        </div>
        <p className="mt-4 text-[14px] font-semibold tracking-tight">
          {errorTitle ?? "Something went wrong"}
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {(error as Error)?.message ?? "Please try again in a moment."}
        </p>
      </div>
    );
  }

  return <>{children(data)}</>;
}
