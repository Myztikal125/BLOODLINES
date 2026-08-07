import { RelationshipService } from "./relationshipService";
import { NPCService } from "../npcService";

export class RelationshipGenerator {

  constructor(
    private relationshipService: RelationshipService,
    private npcService: NPCService
  ) {}

  processNPCRelationships(
    npcData: any
  ) {

    if (!npcData.relationships) return;

    for (const relationship of npcData.relationships) {

      const targetId =
        relationship.npcId ??
        relationship.name
          .toLowerCase()
          .replace(/\s+/g, "_");

      const existingNPC =
        this.npcService.getById(targetId);

      if (!existingNPC) {

        console.log(
          `Missing NPC detected: ${relationship.name}`
        );

        // Future:
        // Send request to NPC Architect
        // Generate connected NPC
      }

      const type =
        this.normalizeType(
          relationship.type
        );

      this.relationshipService.addRelationship({
        fromNpc: npcData.id,
        toNpc: targetId,
        type,
        history:
          relationship.history ?? "",
        strength:
          relationship.strength ?? 50,
        trust:
          relationship.trust ?? 50
      });


      // Create reverse relationship
      this.relationshipService.addRelationship({
        fromNpc: targetId,
        toNpc: npcData.id,
        type: this.reverseType(type),
        history:
          relationship.history ?? "",
        strength:
          relationship.strength ?? 50,
        trust:
          relationship.trust ?? 50
      });
    }
  }


  private normalizeType(
    type: string
  ): any {

    const value =
      type.toLowerCase();

    if (value.includes("mentor"))
      return "mentor";

    if (value.includes("rival"))
      return "rival";

    if (value.includes("friend"))
      return "friend";

    if (value.includes("enemy"))
      return "enemy";

    return "ally";
  }


  private reverseType(
    type: string
  ): any {

    if (type === "mentor")
      return "student";

    if (type === "student")
      return "mentor";

    if (type === "rival")
      return "rival";

    if (type === "friend")
      return "friend";

    if (type === "enemy")
      return "enemy";

    return "ally";
  }
}
