import { NPCService } from "../../npcs/npcService";
import { QuestMemoryBridge } from "./questMemoryBridge";
import { Quest } from "./questTypes";

const npcService = new NPCService();

npcService.load([
  {
    id: "elder_varen",
    name: "Elder Varen",
    location: "Ashenvale",
    role: "Elder"
  }
]);

const bridge = new QuestMemoryBridge(npcService);

const quest: Quest = {
  id: "goblin_threat",
  type: "story",
  name: "The Goblin Threat",
  difficulty: "easy",
  summary: "Defend Ashenvale from goblins.",
  startingLocation: "Ashenvale",
  npcs: ["elder_varen"],
  factions: ["Green Wardens"],
  locations: ["Ashenvale Forest"],
  objectives: ["Defeat goblin scouts"],
  encounters: ["Goblin Patrol"],
  choices: ["Fight", "Negotiate"],
  outcomes: ["Ashenvale survives"],
  rewards: ["Gold", "Trust"],
  consequences: ["Village remembers the hero"],
  stateChanges: {}
};

bridge.questCompleted(
  quest,
  "shadow"
);

console.log(
  npcService.getMemory(
    "elder_varen",
    "shadow"
  )
);
