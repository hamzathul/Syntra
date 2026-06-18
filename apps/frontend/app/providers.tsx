"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ServiceProvider } from "./services/service-context";

export function AppProviders({ children }: { readonly children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 15_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ServiceProvider>{children}</ServiceProvider>
    </QueryClientProvider>
  );
}
