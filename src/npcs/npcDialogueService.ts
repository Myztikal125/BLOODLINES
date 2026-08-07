import { NPCService } from "./npcService";
import { NPCMemoryService } from "./npcMemory";
import { RelationshipService } from "./relationships/relationshipService";

export class NPCDialogueService {

  constructor(
    private npcService: NPCService,
    private memoryService: NPCMemoryService,
    private relationshipService: RelationshipService
  ) {}

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
      relationships
    };
  }
}
