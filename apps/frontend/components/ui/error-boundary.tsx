"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function PageError({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred"}
        </p>
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-32 rounded bg-muted" />
        <div className="mt-1.5 h-4 w-64 rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-9 w-9 rounded-xl bg-muted" />
            </div>
            <div className="h-7 w-16 rounded bg-muted" />
            <div className="mt-1 h-3 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border bg-card p-10 shadow-sm">
        <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-muted" />
        <div className="mx-auto h-5 w-32 rounded bg-muted" />
        <div className="mx-auto mt-1 h-4 w-56 rounded bg-muted" />
      </div>
    </div>
  );
}
