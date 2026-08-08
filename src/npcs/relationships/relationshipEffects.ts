import { NPCMemoryService } from "../npcMemory";

export type RelationshipEvent =
  | "help"
  | "protect"
  | "complete_quest"
  | "threaten"
  | "lie"
  | "betray"
  | "insult"
  | "rescue"
  | "attack"
  | "discover_secret";

export class RelationshipEffects {

  constructor(
    private memoryService: NPCMemoryService
  ) {}

  apply(
    npcId: string,
    playerId: string,
    event: RelationshipEvent,
    description?: string
  ) {

    switch (event) {

      case "help":
        return this.memoryService.adjustRelationship(
          npcId,
          playerId,
          2,
          1,
          0,
          description ?? "Player helped the NPC."
        );

      case "protect":
        return this.memoryService.adjustRelationship(
          npcId,
          playerId,
          5,
          3,
          0,
          description ?? "Player protected the NPC."
        );

      case "complete_quest":
        return this.memoryService.adjustRelationship(
          npcId,
          playerId,
          5,
          3,
          0,
          description ?? "Player successfully completed a quest for the NPC."
        );

      case "threaten":
        return this.memoryService.adjustRelationship(
          npcId,
          playerId,
          -2,
          -3,
          1,
          description ?? "Player threatened the NPC."
        );

      case "lie":
        return this.memoryService.adjustRelationship(
          npcId,
          playerId,
          -3,
          -2,
          0,
          description ?? "Player lied to the NPC."
        );

      case "betray":
        return this.memoryService.adjustRelationship(
          npcId,
          playerId,
          -15,
          -10,
          2,
          description ?? "Player betrayed the NPC."
        );

      case "insult":
        return this.memoryService.adjustRelationship(
          npcId,
          playerId,
          -1,
          -2,
          0,
          description ?? "Player insulted the NPC."
        );

      case "rescue":
        return this.memoryService.adjustRelationship(
          npcId,
          playerId,
          10,
          5,
          0,
          description ?? "Player rescued the NPC."
        );

      case "attack":
        return this.memoryService.adjustRelationship(
          npcId,
          playerId,
          -10,
          -8,
          5,
          description ?? "Player attacked the NPC."
        );

      case "discover_secret":
        return this.memoryService.adjustRelationship(
          npcId,
          playerId,
          0,
          1,
          0,
          description ?? "Player discovered something important about the NPC."
        );
    }
  }
}
