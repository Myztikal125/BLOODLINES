import { NPCService } from "./npcService";
import { loadContent } from "../engine/contentLoader";

const service = new NPCService();

const npcs = loadContent("npcs");

service.load(npcs);

console.log("All NPCs:");
console.log(service.getAll());

console.log("Ashenvale NPCs:");
console.log(
  service.getByLocation("ashenvale")
);

service.changeTrust(
  "elder_varen",
  10
);

console.log(
  "After trust change:"
);

console.log(
  service.getById("elder_varen")
);
