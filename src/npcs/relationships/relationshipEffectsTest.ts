import { NPCMemoryService } from "../npcMemory";
import { RelationshipEffects } from "./relationshipEffects";

const memoryService = new NPCMemoryService();
const effects = new RelationshipEffects(memoryService);

const npcId = "elder_varen";
const playerId = "shadow";

console.log("\n=== INITIAL ===");
console.log(memoryService.getMemory(npcId, playerId));

console.log("\n=== PLAYER HELPS ===");
effects.apply(
  npcId,
  playerId,
  "help",
  "Shadow helped Elder Varen."
);
console.log(memoryService.getMemory(npcId, playerId));

console.log("\n=== PLAYER PROTECTS ===");
effects.apply(
  npcId,
  playerId,
  "protect",
  "Shadow protected Ashenvale."
);
console.log(memoryService.getMemory(npcId, playerId));

console.log("\n=== PLAYER THREATENS ===");
effects.apply(
  npcId,
  playerId,
  "threaten",
  "Shadow threatened Elder Varen."
);
console.log(memoryService.getMemory(npcId, playerId));

console.log("\n=== PLAYER RESCUES ===");
effects.apply(
  npcId,
  playerId,
  "rescue",
  "Shadow rescued Elder Varen."
);
console.log(memoryService.getMemory(npcId, playerId));

console.log("\n=== PLAYER BETRAYS ===");
effects.apply(
  npcId,
  playerId,
  "betray",
  "Shadow betrayed Elder Varen."
);
console.log(memoryService.getMemory(npcId, playerId));
