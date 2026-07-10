import { BaseService, withErrorLogging, type LoggerPort } from "backend-p";
import type { HealthStatusDto } from "shared";
import type { HealthRepository } from "./health.repository";

export interface HealthServicePort {
  getHealthStatus(): Promise<HealthStatusDto>;
}

export class HealthService extends BaseService implements HealthServicePort {
  constructor(
    private readonly healthRepository: HealthRepository,
    private readonly logger: LoggerPort,
  ) {
    super("HealthService");
  }

  async getHealthStatus(): Promise<HealthStatusDto> {
    return withErrorLogging(
      `${this.name}.getHealthStatus`,
      this.logger,
      async () => {
        const currentHealth = await this.healthRepository.getCurrentStatus();
        const checkedAt = new Date().toISOString();

        return {
          service: currentHealth.service,
          status: currentHealth.status,
          uptime: process.uptime(),
          checkedAt,
        };
      },
    );
  }
}
