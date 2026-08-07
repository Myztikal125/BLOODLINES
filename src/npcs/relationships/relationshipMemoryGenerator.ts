import { NPCRelationship } from "./types";
import { NPCMemoryService } from "../npcMemory";

export class RelationshipMemoryGenerator {

  constructor(
    private memoryService: NPCMemoryService
  ) {}

  generate(
    relationship: NPCRelationship
  ) {

    const fromMemory =
      this.createOwnerMemory(
        relationship
      );

    const toMemory =
      this.createSubjectMemory(
        relationship
      );

    this.memoryService.addMemory(
      relationship.fromNpc,
      relationship.toNpc,
      fromMemory,
      this.getImpact(relationship.type)
    );

    this.memoryService.addMemory(
      relationship.toNpc,
      relationship.fromNpc,
      toMemory,
      this.getImpact(relationship.type)
    );
  }


  private createOwnerMemory(
    relationship: NPCRelationship
  ): string {

    switch (relationship.type) {

      case "mentor":
        return `I learned from ${relationship.toNpc}. Their guidance shaped my path.`;

      case "friend":
        return `${relationship.toNpc} has stood beside me through difficult times.`;

      case "rival":
        return `${relationship.toNpc} challenges my beliefs and pushes me to improve.`;

      case "enemy":
        return `${relationship.toNpc} is a threat I cannot ignore.`;

      default:
        return `I have a history with ${relationship.toNpc}.`;
    }
  }


  private createSubjectMemory(
    relationship: NPCRelationship
  ): string {

    switch (relationship.type) {

      case "mentor":
        return `${relationship.fromNpc} was my student. I watched them grow and develop their abilities.`;

      case "friend":
        return `${relationship.fromNpc} is someone I trust and value.`;

      case "rival":
        return `${relationship.fromNpc} is my rival. Our conflicts have made us stronger.`;

      case "enemy":
        return `${relationship.fromNpc} is someone I consider dangerous.`;

      default:
        return `I have a history with ${relationship.fromNpc}.`;
    }
  }


  private getImpact(
    type: string
  ): number {

    switch(type) {

      case "mentor":
        return 40;

      case "friend":
        return 30;

      case "rival":
        return -10;

      case "enemy":
        return -50;

      default:
        return 0;
    }
  }
}
