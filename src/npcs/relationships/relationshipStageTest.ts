import { NPCMemoryService } from "../npcMemory";
import { RelationshipEffects } from "./relationshipEffects";

const memory = new NPCMemoryService();
const effects = new RelationshipEffects(memory);

const npc = "elder_varen";
const player = "shadow";

console.log("=== THREATS ===");

for (let i = 0; i < 10; i++) {
  effects.apply(
    npc,
    player,
    "threaten",
    `Shadow threatened Elder Varen (${i + 1}).`
  );
}

const result = memory.getMemory(npc, player);

console.log(result);

console.log("\nRelationship Stage:");
console.log(result.relationshipStage);
