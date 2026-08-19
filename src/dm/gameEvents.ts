export type GameEventType =
  | "narration_delta"
  | "narration"
  | "tool_activity"
  | "npc_activity"
  | "system"
  | "error"
  | "engine_result";

export interface GameEvent {
  type: GameEventType;
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export function gameEvent(
  type: GameEventType,
  content: string,
  metadata?: Record<string, unknown>,
): GameEvent {
  return { type, content, timestamp: Date.now(), metadata };
}
