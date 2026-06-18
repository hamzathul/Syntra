"use client";

import { useQuery } from "@tanstack/react-query";
import type { HealthServicePort } from "frontend-p";

export const healthQueryKey = ["health"] as const;

export const useHealthQuery = (healthService: HealthServicePort) =>
  useQuery({
    queryKey: healthQueryKey,
    queryFn: () => healthService.getHealth(),
    refetchInterval: 30_000,
  });
