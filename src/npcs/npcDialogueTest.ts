import { NPCDialogueService } from "./npcDialogueService";
import { NPCService } from "./npcService";
import { NPCMemoryService } from "./npcMemory";
import { RelationshipService } from "./relationships/relationshipService";

const npcService = new NPCService();
const memoryService = new NPCMemoryService();
const relationshipService = new RelationshipService();

npcService.load([
  {
    id: "elder_varen",
    name: "Elder Varen",
    role: "Keeper",
    location: "Ashenvale"
  }
]);

memoryService.addMemory(
  "elder_varen",
  "shadow",
  "Shadow protected Ashenvale from goblins.",
  25
);

const dialogue =
  new NPCDialogueService(
    npcService,
    memoryService,
    relationshipService
  );

console.log(
  dialogue.talk(
    "elder_varen",
    "shadow"
  )
);
