import { NPCRelationship } from "./types";

export class RelationshipService {

  private relationships: NPCRelationship[] = [];

  addRelationship(
    relationship: NPCRelationship
  ) {
    this.relationships.push(
      relationship
    );
  }

  getRelationshipsForNPC(
    npcId: string
  ) {
    return this.relationships.filter(
      relationship =>
        relationship.fromNpc === npcId ||
        relationship.toNpc === npcId
    );
  }

  getRelationship(
    fromNpc: string,
    toNpc: string
  ) {

    return this.relationships.find(
      relationship =>
        relationship.fromNpc === fromNpc &&
        relationship.toNpc === toNpc
    );
  }

  updateTrust(
    fromNpc: string,
    toNpc: string,
    amount: number
  ) {

    const relationship =
      this.getRelationship(
        fromNpc,
        toNpc
      );

    if (!relationship) return;

    relationship.trust += amount;
  }

  updateStrength(
    fromNpc: string,
    toNpc: string,
    amount: number
  ) {

    const relationship =
      this.getRelationship(
        fromNpc,
        toNpc
      );

    if (!relationship) return;

    relationship.strength += amount;
  }

  getAll() {
    return this.relationships;
  }
}
