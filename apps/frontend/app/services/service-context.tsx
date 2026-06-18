"use client";

import {
  ApiClientFactory,
  HealthServiceFactory,
  type HealthServicePort,
} from "frontend-p";
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

interface Services {
  readonly healthService: HealthServicePort;
}

const ServiceContext = createContext<Services | null>(null);

export function ServiceProvider({ children }: { readonly children: ReactNode }) {
  const services = useMemo<Services>(() => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";
    const httpClient = ApiClientFactory.create(baseUrl);

    return {
      healthService: HealthServiceFactory.create(httpClient),
    };
  }, []);

  return (
    <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>
  );
}

export function useServices(): Services {
  const services = useContext(ServiceContext);

  if (services === null) {
    throw new Error("useServices must be used inside ServiceProvider");
  }

  return services;
}
