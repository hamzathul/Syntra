import {
  BaseService,
  type DomainEventBus,
  type LoggerPort,
  type TransactionManager,
  withErrorLogging,
} from "backend-p";
import type { HealthStatusDto } from "shared";
import type { HealthRepository } from "../repositories/health.repository";

export interface HealthServicePort {
  getHealthStatus(): Promise<HealthStatusDto>;
}

export class HealthService extends BaseService implements HealthServicePort {
  constructor(
    private readonly healthRepository: HealthRepository,
    private readonly transactionManager: TransactionManager,
    private readonly eventBus: DomainEventBus,
    private readonly logger: LoggerPort,
  ) {
    super("HealthService");
  }

  async getHealthStatus(): Promise<HealthStatusDto> {
    return withErrorLogging(
      `${this.name}.getHealthStatus`,
      this.logger,
      async () =>
        this.transactionManager.runInTransaction(async () => {
          const currentHealth = await this.healthRepository.getCurrentStatus();
          const checkedAt = new Date().toISOString();
          const healthStatus: HealthStatusDto = {
            service: currentHealth.service,
            status: currentHealth.status,
            uptime: process.uptime(),
            checkedAt,
          };

          this.eventBus.publish({
            name: "health.checked",
            occurredAt: checkedAt,
            payload: {
              service: healthStatus.service,
              status: healthStatus.status,
            },
          });

          return healthStatus;
        }),
    );
  }
}
