import {
  healthResponseSchema,
  type HealthResponseDto,
} from "shared";
import type { HttpClient } from "../http/http-client";

export interface HealthServicePort {
  getHealth(): Promise<HealthResponseDto>;
}

export class HealthService implements HealthServicePort {
  constructor(private readonly httpClient: HttpClient) {}

  async getHealth(): Promise<HealthResponseDto> {
    const response = await this.httpClient.get<unknown>("/v1/health");
    return healthResponseSchema.parse(response);
  }
}

export class HealthServiceFactory {
  static create(httpClient: HttpClient): HealthServicePort {
    return new HealthService(httpClient);
  }
}
