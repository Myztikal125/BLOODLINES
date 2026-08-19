export type EventHandler<T> = (event: T) => void | Promise<void>;

export interface DomainEventMap {
  "character.created": { characterId: string };
  "character.updated": { characterId: string; changedFields: string[] };
  "combat.started": { encounterId: string };
  "combat.ended": { encounterId: string; victory: boolean };
  "quest.advanced": { questId: string; nodeId: string };
}

type UnknownEventHandler = (event: unknown) => void | Promise<void>;

/**
 * Small in-process event relay. State-changing systems can publish facts while
 * narrative, AI, logging, and UI consumers subscribe without being coupled to
 * the producer.
 */
export class EventBus<Events extends Record<string, unknown> = DomainEventMap> {
  private readonly handlers = new Map<keyof Events, Set<UnknownEventHandler>>();

  on<K extends keyof Events>(eventName: K, handler: EventHandler<Events[K]>): () => void {
    const handlers = this.handlers.get(eventName) ?? new Set<UnknownEventHandler>();
    const wrapped: UnknownEventHandler = event => handler(event as Events[K]);
    handlers.add(wrapped);
    this.handlers.set(eventName, handlers);
    return () => handlers.delete(wrapped);
  }

  emit<K extends keyof Events>(eventName: K, event: Events[K]): void {
    const handlers = this.handlers.get(eventName);
    if (!handlers) return;
    for (const handler of handlers) handler(event);
  }

  clear(): void {
    this.handlers.clear();
  }
}
