import { ArrivalService } from "./arrivalService";
import { NPCService } from "../../npcs/npcService";
import { NPCMemoryService } from "../../npcs/npcMemory";

const npcService = new NPCService();
const memoryService = new NPCMemoryService();

npcService.load([
  {
    id: "elder_varen",
    name: "Elder Varen",
    role: "Keeper",
    location: "Ashenvale"
  },
  {
    id: "thalia",
    name: "Thalia",
    role: "Druid",
    location: "Ashenvale"
  }
]);

const arrival =
  new ArrivalService(
    npcService,
    memoryService
  );

console.log(
  arrival.arrive(
    "shadow",
    "Ashenvale"
  )
);

console.log(
  "Elder Varen memory:"
);

console.log(
  memoryService.getMemory(
    "elder_varen",
    "shadow"
  )
);
