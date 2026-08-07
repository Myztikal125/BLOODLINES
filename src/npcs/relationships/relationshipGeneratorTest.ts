import { RelationshipService } from "./relationshipService";
import { RelationshipGenerator } from "./relationshipGenerator";
import { NPCService } from "../npcService";

const npcService = new NPCService();
const relationshipService = new RelationshipService();

npcService.load([
  {
    id: "thalia",
    name: "Thalia Moonsong"
  }
]);

const generator = new RelationshipGenerator(
  relationshipService,
  npcService
);

const thalia = {
  id: "thalia",
  relationships: [
    {
      name: "Eldric Treeheart",
      type: "Mentor",
      history: "Eldric taught Thalia the ancient druid ways."
    },
    {
      name: "Liora Brightglade",
      type: "Rival",
      history: "They disagree about the future of Ashenvale."
    }
  ]
};

generator.processNPCRelationships(thalia);

console.log("Relationships:");
console.log(
  relationshipService.getAll()
);
