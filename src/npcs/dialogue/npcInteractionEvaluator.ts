import { askAI } from "../../ai/aiClient";
import { NPCInteractionResult } from "./types";

export async function evaluateNPCInteraction(
  npcName: string,
  playerId: string,
  playerMessage: string,
  npcResponse: string,
  relationshipStage: string
): Promise<NPCInteractionResult> {

  const prompt = `
Evaluate this BLOODLINES NPC interaction.

NPC:
${npcName}

Player:
${playerId}

Current relationship:
${relationshipStage}

Player message:
${playerMessage}

NPC response:
${npcResponse}

Determine how this interaction should affect the NPC's memory and relationship with the player.

Return ONLY valid JSON:

{
  "response": "",
  "memoryEvent": {
    "event": "",
    "impact": 0
  },
  "relationshipChange": {
    "trust": 0,
    "respect": 0,
    "fear": 0
  }
}

Rules:

- impact must be between -10 and 10.
- trust change must be between -5 and 5.
- respect change must be between -5 and 5.
- fear change must be between -5 and 5.
- Do not invent events that did not happen.
- Do not create quests.
- Do not change world state.
- Do not determine character stats.
- Evaluate only the social consequences of this interaction.
`;

  const systemPrompt = `
You are the BLOODLINES NPC Interaction Evaluator.

Your job is to analyze conversations between players and persistent NPCs.

The game engine owns all permanent state.

You may recommend:
- memories
- trust changes
- respect changes
- fear changes

You may NOT directly modify game state.

Return valid JSON only.
`;

  const raw = await askAI(
    prompt,
    1000,
    systemPrompt
  );

  try {
    const parsed = JSON.parse(raw);

    return {
      response: parsed.response ?? npcResponse,

      memoryEvent: {
        event: parsed.memoryEvent?.event ?? "Conversation with player.",
        impact: clamp(
          Number(parsed.memoryEvent?.impact ?? 0),
          -10,
          10
        )
      },

      relationshipChange: {
        trust: clamp(
          Number(parsed.relationshipChange?.trust ?? 0),
          -5,
          5
        ),
        respect: clamp(
          Number(parsed.relationshipChange?.respect ?? 0),
          -5,
          5
        ),
        fear: clamp(
          Number(parsed.relationshipChange?.fear ?? 0),
          -5,
          5
        )
      }
    };

  } catch {
    return {
      response: npcResponse,

      memoryEvent: {
        event: "NPC conversation occurred.",
        impact: 0
      },

      relationshipChange: {
        trust: 0,
        respect: 0,
        fear: 0
      }
    };
  }
}

function clamp(
  value: number,
  min: number,
  max: number
): number {

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    min,
    Math.min(max, value)
  );
}
