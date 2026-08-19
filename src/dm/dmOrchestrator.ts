import type { GameEvent } from "./gameEvents";
import { gameEvent } from "./gameEvents";
import { buildDmSystemPrompt } from "./dmGuidelines";
import { ToolRegistry } from "../ai/toolContracts";
import { GameSession } from "./gameSession";

export interface DmTurnResult {
  narration: string;
  events: GameEvent[];
}

export class DmOrchestrator {
  constructor(
    private readonly session: GameSession,
    private readonly tools: ToolRegistry,
  ) {}

  getSystemPrompt(): string {
    return buildDmSystemPrompt();
  }

  async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const result = await this.tools.execute(name, args);
    const event = gameEvent("engine_result", JSON.stringify({ tool: name, result }), { tool: name });
    this.session.emit(event);
    return result;
  }

  publishNarration(narration: string): void {
    this.session.emit(gameEvent("narration", narration));
  }

  publishSystem(message: string): void {
    this.session.emit(gameEvent("system", message));
  }
}
