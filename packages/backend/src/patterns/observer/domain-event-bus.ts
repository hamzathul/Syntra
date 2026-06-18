export interface DomainEvent {
  readonly name: string;
  readonly occurredAt: string;
  readonly payload?: Record<string, unknown>;
}

export type DomainEventHandler<TEvent extends DomainEvent = DomainEvent> = (
  event: TEvent,
) => void | Promise<void>;

export class DomainEventBus {
  private static instance: DomainEventBus | null = null;

  private readonly handlers = new Map<string, Set<DomainEventHandler>>();

  private constructor() {}

  static getInstance(): DomainEventBus {
    if (DomainEventBus.instance === null) {
      DomainEventBus.instance = new DomainEventBus();
    }

    return DomainEventBus.instance;
  }

  subscribe(eventName: string, handler: DomainEventHandler): () => void {
    const eventHandlers = this.handlers.get(eventName) ?? new Set();
    eventHandlers.add(handler);
    this.handlers.set(eventName, eventHandlers);

    return () => {
      eventHandlers.delete(handler);
    };
  }

  publish<TEvent extends DomainEvent>(event: TEvent): void {
    const eventHandlers = this.handlers.get(event.name);

    if (eventHandlers === undefined) {
      return;
    }

    eventHandlers.forEach((handler) => {
      void handler(event);
    });
  }
}
