import { NPCService } from "./npcService";

const npcService = new NPCService();

npcService.load([
  {
    id: "elder_varen",
    name: "Elder Varen",
    location: "Ashenvale",
    role: "Elder"
  }
]);

const memory = npcService.rememberEvent(
  "elder_varen",
  "shadow",
  "Shadow protected Ashenvale from goblins",
  25
);

console.log("NPC Memory Test:");
console.log(memory);
