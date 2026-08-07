import { NPCMemoryService } from "../npcMemory";
import { RelationshipMemoryGenerator } from "./relationshipMemoryGenerator";

const memoryService = new NPCMemoryService();

const generator = new RelationshipMemoryGenerator(
  memoryService
);

generator.generate({
  fromNpc: "thalia",
  toNpc: "eldric",
  type: "mentor",
  history: "Eldric taught Thalia the ancient druid ways.",
  strength: 90,
  trust: 100
});

console.log("Thalia remembers:");
console.log(
  memoryService.getMemory(
    "thalia",
    "eldric"
  )
);

console.log("Eldric remembers:");
console.log(
  memoryService.getMemory(
    "eldric",
    "thalia"
  )
);
