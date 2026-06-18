import {
  DomainEventBus,
  NoopTransactionManager,
} from "backend-p";
import { HealthController } from "../controllers/health.controller";
import { HealthRepository } from "../repositories/health.repository";
import { HealthService } from "../services/health.service";
import logger from "../utils/logger";

export class HealthModuleFactory {
  private static controller: HealthController | null = null;
  private static hasRegisteredObservers = false;

  static createController(): HealthController {
    if (HealthModuleFactory.controller === null) {
      const eventBus = DomainEventBus.getInstance();
      const repository = new HealthRepository();
      const transactionManager = new NoopTransactionManager();
      const service = new HealthService(
        repository,
        transactionManager,
        eventBus,
        logger,
      );

      HealthModuleFactory.registerObservers(eventBus);
      HealthModuleFactory.controller = new HealthController(service);
    }

    return HealthModuleFactory.controller;
  }

  private static registerObservers(eventBus: DomainEventBus): void {
    if (HealthModuleFactory.hasRegisteredObservers) {
      return;
    }

    eventBus.subscribe("health.checked", (event) => {
      logger.info(
        { eventName: event.name, payload: event.payload },
        "Health check observed",
      );
    });
    HealthModuleFactory.hasRegisteredObservers = true;
  }
}
