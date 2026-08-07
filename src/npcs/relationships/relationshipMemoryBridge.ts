import { NPCMemoryService } from "../npcMemory";
import { NPCRelationship } from "./types";

export class RelationshipMemoryBridge {

  constructor(
    private memoryService: NPCMemoryService
  ) {}

  createRelationshipMemories(
    relationship: NPCRelationship
  ) {

    this.memoryService.addMemory(
      relationship.fromNpc,
      relationship.toNpc,
      `Relationship formed: ${relationship.type}. ${relationship.history}`,
      0
    );

    this.memoryService.addMemory(
      relationship.toNpc,
      relationship.fromNpc,
      `Relationship formed: ${relationship.type}. ${relationship.history}`,
      0
    );

    return {
      from: relationship.fromNpc,
      to: relationship.toNpc,
      memoriesCreated: true
    };
  }
}
