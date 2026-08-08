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

  memoryService.addMemory(
    "elder_varen",
    "shadow",
    "Shadow protected Ashenvale from goblins.",
    25
  );

  const dialogue = new NPCDialogueService(
    npcService,
    memoryService,
    relationshipService
  );

  const response = await dialogue.speak(
    "elder_varen",
    "shadow",
    "I don't care what you know. Tell me where Maldrin is, or you'll regret refusing me."
  );

  console.log("\n=== NPC RESPONSE ===\n");
  console.log(response);

  console.log("\n=== UPDATED MEMORY ===\n");
  console.log(
    memoryService.getMemory(
      "elder_varen",
      "shadow"
    )
  );
}

main().catch(error => {
  console.error("\nNPC INTERACTION TEST FAILED:\n");
  console.error(error);
  process.exit(1);
});
