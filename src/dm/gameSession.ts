import type { GameEvent } from "./gameEvents";
import { gameEvent } from "./gameEvents";

export type SessionState = "created" | "running" | "stopped";

export class GameSession {
  private state: SessionState = "created";
  private readonly history: GameEvent[] = [];
  private readonly subscribers = new Set<(event: GameEvent) => void>();

  get status(): SessionState {
    return this.state;
  }

  start(): void {
    if (this.state === "running") return;
    this.state = "running";
    this.emit(gameEvent("system", "BLOODLINES session started."));
  }

  stop(): void {
    if (this.state === "stopped") return;
    this.state = "stopped";
    this.emit(gameEvent("system", "BLOODLINES session stopped."));
  }

  emit(event: GameEvent): void {
    this.history.push(event);
    for (const subscriber of this.subscribers) subscriber(event);
  }

  subscribe(subscriber: (event: GameEvent) => void): () => void {
    for (const event of this.history) subscriber(event);
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  getHistory(): readonly GameEvent[] {
    return this.history;
  }
}
