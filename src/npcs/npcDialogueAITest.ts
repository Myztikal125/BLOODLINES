import { NPCService } from "./npcService";
import { NPCMemoryService } from "./npcMemory";
import { NPCDialogueService } from "./npcDialogueService";
import { RelationshipService } from "./relationships/relationshipService";

async function main() {

  const npcService = new NPCService();
  const memoryService = new NPCMemoryService();
  const relationshipService = new RelationshipService();

  npcService.load([
    {
      id: "elder_varen",
      name: "Elder Varen",
      role: "Elder",
      location: "Ashenvale",

      identity: {
        ancestry: "Human",
        background: "Village Elder",
        role: "Elder",
        location: "Ashenvale"
      },

      personality: {
        traits: [
          "patient",
          "protective",
          "observant"
        ],
        values: [
          "community",
          "knowledge",
          "duty"
        ],
        flaws: [
          "overprotective"
        ],
        humor: "dry",
        speechStyle: "calm and deliberate",
        temperament: "patient"
      },

      psychology: {
        fears: [
          "losing Ashenvale"
        ],
        motivations: [
          "protect the village"
        ],
        desires: [
          "see the next generation survive"
        ],
        secrets: [
          "He knows more about the missing scholar than he admits."
        ]
      },

      dialogue: {
        greetingStyle: "warm but cautious",
        speechPatterns: [
          "uses old sayings",
          "speaks deliberately"
        ],
        topicsTheyAvoid: [
          "his past failures"
        ],
        emotionalTriggers: [
          "threats against Ashenvale"
        ]
      },

      goals: {
        shortTerm: [
          "protect Ashenvale"
        ],
        longTerm: [
          "ensure the village survives"
        ]
      },

      stateVariables: {
        mood: "calm"
      }
    }
  ]);

  memoryService.addMemory(
    "elder_varen",
    "shadow",
    "Shadow protected Ashenvale from goblins.",
    25
  );

  memoryService.addFact(
    "elder_varen",
    "shadow",
    "Shadow is an elf wizard."
  );

  const dialogue =
    new NPCDialogueService(
      npcService,
      memoryService,
      relationshipService
    );

  const response =
    await dialogue.speak(
      "elder_varen",
      "shadow",
      "Elder Varen, I need information about the missing scholar."
    );

  console.log("\nNPC AI RESPONSE:\n");
  console.log(response);
}

main().catch(error => {
  console.error("\nNPC AI TEST FAILED:\n");
  console.error(error);
  process.exit(1);
});
