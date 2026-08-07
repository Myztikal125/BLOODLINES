import { NPCService } from "../npcs/npcService";
import { PersonalityService } from "../npcs/personality/personalityService";
import { RelationshipService } from "../npcs/relationships/relationshipService";
import { WorldInitializer } from "./worldInitializer";

const npcService = new NPCService();
const personalityService = new PersonalityService();
const relationshipService = new RelationshipService();

const initializer =
  new WorldInitializer(
    npcService,
    personalityService,
    relationshipService
  );

const world = {
  id: "bloodlands",
  name: "The Bloodlands"
};

const npcs = [
  {
    id: "thalia",
    name: "Thalia",
    role: "Druid",
    location: "Ashenvale"
  },
  {
    id: "eldric_treeheart",
    name: "Eldric Treeheart",
    role: "Druid Mentor",
    location: "Ashenvale"
  }
];

initializer.initialize(
  world,
  npcs
);

console.log("NPCs:");
console.log(
  npcService.getAll()
);

console.log("Relationships:");
console.log(
  relationshipService.getAll()
);
