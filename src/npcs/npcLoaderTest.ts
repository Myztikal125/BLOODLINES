import { NPCService } from "./npcService";
import { PersonalityService } from "./personality/personalityService";
import { NPCLoader } from "./npcLoader";

const npcService = new NPCService();
const personalityService = new PersonalityService();

const loader = new NPCLoader(
  npcService,
  personalityService
);

const thalia = {
  id: "NPC001",
  name: "Thalia Moonsong",

  identity: {
    role: "Guardian of Ashenvale",
    location: "Elder Grove of Ashenvale",
    faction: "Circle of the Verdant Tide"
  },

  personality: {
    traits: [
      "Wise",
      "Compassionate",
      "Mysterious"
    ],
    values: [
      "Balance",
      "Nature"
    ],
    flaws: [
      "Overly secretive"
    ],
    humor: "Dry and witty",
    speechStyle: "Soft and melodic",
    temperament: "Calm"
  },

  psychology: {
    fears: [
      "Loss of nature magic"
    ],
    motivations: [
      "Protect Ashenvale"
    ]
  },

  stateVariables: {
    trust: 50
  }
};

loader.loadNPC(thalia);

console.log("NPC:");
console.log(npcService.getById("NPC001"));

console.log("Personality:");
console.log(personalityService.get("NPC001"));
