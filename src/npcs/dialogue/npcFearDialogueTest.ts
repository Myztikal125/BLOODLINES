import { NPCService } from "../npcService";
import { NPCMemoryService } from "../npcMemory";
import { NPCDialogueService } from "../npcDialogueService";
import { RelationshipService } from "../relationships/relationshipService";

async function main() {

  const npcService = new NPCService();
  const memoryService = new NPCMemoryService();
  const relationshipService = new RelationshipService();

  npcService.load([
    {
      id: "elder_varen",
      name: "Elder Varen",
      role: "Elder",
      location: "Ashenvale"
    }
  ]);

  memoryService.adjustRelationship(
    "elder_varen",
    "shadow",
    -10,
    -10,
    10,
    "Shadow repeatedly threatened Elder Varen."
  );

  const memory = memoryService.getMemory(
    "elder_varen",
    "shadow"
  );

  console.log("\n=== RELATIONSHIP BEFORE DIALOGUE ===\n");
  console.log(memory);

  const dialogue = new NPCDialogueService(
    npcService,
    memoryService,
    relationshipService
  );

  const response = await dialogue.speak(
    "elder_varen",
    "shadow",
    "Tell me where Maldrin is."
  );

  console.log("\n=== NPC RESPONSE ===\n");
  console.log(response);
}

main().catch(error => {
  console.error("\nTEST FAILED:\n");
  console.error(error);
  process.exit(1);
});
