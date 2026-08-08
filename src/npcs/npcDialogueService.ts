import { askAI } from "../ai/aiClient";
import { NPCService } from "./npcService";
import { NPCMemoryService } from "./npcMemory";
import { RelationshipService } from "./relationships/relationshipService";
import { evaluateNPCInteraction } from "./dialogue/npcInteractionEvaluator";

export class NPCDialogueService {

  constructor(
    private npcService: NPCService,
    private memoryService: NPCMemoryService,
    private relationshipService: RelationshipService
  ) {}

  buildContext(
    npcId: string,
    playerId: string
  ): string {

    const npc =
      this.npcService.getById(npcId);

    if (!npc) {
      return "Unknown NPC.";
    }

    const memory =
      this.memoryService.getMemory(
        npcId,
        playerId
      );

    const relationships =
      this.relationshipService.getRelationshipsForNPC(
        npcId
      );

    return `
NPC ID: ${npc.id}
Name: ${npc.name}

Identity:
${JSON.stringify(npc.identity ?? {}, null, 2)}

Appearance:
${JSON.stringify(npc.appearance ?? {}, null, 2)}

Personality:
${JSON.stringify(npc.personality ?? {}, null, 2)}

Psychology:
${JSON.stringify(npc.psychology ?? {}, null, 2)}

Dialogue Style:
${JSON.stringify(npc.dialogue ?? {}, null, 2)}

Goals:
${JSON.stringify(npc.goals ?? {}, null, 2)}

Quest Hooks:
${JSON.stringify(npc.questHooks ?? [], null, 2)}

Current Mood:
${npc.stateVariables?.mood ?? "neutral"}

Static NPC Relationships:
${JSON.stringify(
  npc.relationships ?? [],
  null,
  2
)}

Runtime NPC Relationships:
${JSON.stringify(
  relationships,
  null,
  2
)}

Relationship With Player:
Trust: ${memory.trust}
Respect: ${memory.respect}
Fear: ${memory.fear}
Relationship Stage: ${memory.relationshipStage}

Known Facts About Player:
${memory.knownFacts.join("\n") || "None"}

Memories Of Player:
${memory.memories
  .map(
    m =>
      `- ${m.event} (impact: ${m.impact})`
  )
  .join("\n") || "None"}

Completed Quests With Player:
${memory.completedQuests.join("\n") || "None"}
`.trim();
  }

  async speak(
    npcId: string,
    playerId: string,
    playerMessage: string
  ): Promise<string> {

    const npc =
      this.npcService.getById(npcId);

    if (!npc) {
      return "Unknown NPC.";
    }

    const context =
      this.buildContext(
        npcId,
        playerId
      );

    const systemPrompt = `
You are an NPC in the BLOODLINES RPG.

You are NOT the narrator.
You are NOT the game master.
You are NOT a generic assistant.

You are portraying the specific NPC described below.

NPC CONTEXT:
${context}

ROLEPLAY RULES:

1. Stay in character.
2. Respect the NPC's personality, history, fears, goals, secrets, and speech style.
3. Remember the NPC's relationship with the player.
4. Use remembered events when appropriate.
5. Do not invent facts that contradict the supplied context.
6. Do not reveal secrets unless the NPC has a believable reason to reveal them.
7. Do not automatically trust the player.
8. Do not automatically hate the player.
9. Let trust, respect, fear, mood, and memories influence the response.
10. NPC relationships should influence what the NPC says about other characters.
11. The NPC can refuse requests, lie, become angry, become afraid, joke, negotiate, or change their attitude.
12. Keep responses appropriate for an interactive RPG conversation.
13. Never claim that a quest, relationship, item, world event, or game-state change occurred unless it is present in the supplied context.
14. Do not modify game state yourself.

Respond only with what the NPC says and, when useful, brief physical/emotional actions.
`;

    const npcResponse =
      await askAI(
        `
The player says:

"${playerMessage}"

Respond as the NPC.
`,
        1200,
        systemPrompt
      );

    const memory =
      this.memoryService.getMemory(
        npcId,
        playerId
      );

    const evaluation =
      await evaluateNPCInteraction(
        npc.name,
        playerId,
        playerMessage,
        npcResponse,
        memory.relationshipStage
      );

    this.memoryService.adjustRelationship(
      npcId,
      playerId,
      evaluation.relationshipChange.trust,
      evaluation.relationshipChange.respect,
      evaluation.relationshipChange.fear,
      evaluation.memoryEvent.event
    );

    return npcResponse;
  }

  talk(
    npcId: string,
    playerId: string
  ) {

    const npc =
      this.npcService.getById(npcId);

    if (!npc) {
      return "Unknown NPC.";
    }

    const memory =
      this.memoryService.getMemory(
        npcId,
        playerId
      );

    const relationships =
      this.relationshipService.getRelationshipsForNPC(
        npcId
      );

    let greeting =
      `${npc.name} looks at you.`;

    if (memory.memories.length > 0) {
      greeting +=
        ` They remember your previous encounters.`;
    }

    if (memory.relationshipStage === "friend") {
      greeting +=
        ` They greet you warmly as a trusted ally.`;

    } else if (
      memory.relationshipStage === "enemy"
    ) {
      greeting +=
        ` They watch you with suspicion.`;
    }

    if (relationships.length > 0) {
      greeting +=
        ` Their connections influence how they see the world.`;
    }

    return {
      npc: npc.name,
      dialogue: greeting,
      memory,
      relationships,
      context: this.buildContext(
        npcId,
        playerId
      )
    };
  }
}
