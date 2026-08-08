import "dotenv/config";
import fs from "fs";

import { GameRunner } from "../engine/game/gameRunner";
import { TerminalInterface } from "./interface/terminal";
import { GameController } from "../engine/game/gameController";
import { CombatController } from "../engine/combat/combatController";
import { RulesRuntime } from "../engine/rules/rulesRuntime";
import { loadGame, saveGame } from "./save/saveManager";

import { loadData } from "./engine/dataLoader";
import { NPCService } from "./npcs/npcService";
import { PersonalityService } from "./npcs/personality/personalityService";
import { RelationshipService } from "./npcs/relationships/relationshipService";
import { WorldInitializer } from "./world/worldInitializer";

const runner = new GameRunner();
const saved = loadGame();

let player;

if (saved?.character) {
  console.log("Loading saved adventure...");
  player = { data: saved.character };
} else {
  console.log("Creating new adventure...");
  player = runner.start({
    name: "Shadow",
    ancestry: "elf",
    background: "scholar",
    className: "wizard",
    bloodline: "shadowveil"
  });
}

const npcService = new NPCService();
const personalityService = new PersonalityService();
const relationshipService = new RelationshipService();

const worldInitializer = new WorldInitializer(
  npcService,
  personalityService,
  relationshipService
);

const worldData = loadData("world", "world");
const npcData = loadData("npcs", "npcs");

worldInitializer.initialize(worldData, npcData);

const state = {
  character: player.data,
  location: saved?.world?.currentLocation ?? "Ashenvale",
  inventory: saved?.inventory?.items ?? []
};

let rulesRuntime: RulesRuntime | undefined;

if (fs.existsSync("data/rules/compiledRules.json")) {
  rulesRuntime = new RulesRuntime();
  console.log("✓ Authoritative Rules Bible compiled data loaded.");
} else {
  console.log(
    "⚠ No compiled Rules Bible data found. Run npm run compile:rules before using runtime rule enforcement."
  );
}

const combat = new CombatController(rulesRuntime);

const controller = new GameController(
  state,
  combat,
  npcService,
  relationshipService,
  rulesRuntime
);

const terminal = new TerminalInterface();

terminal.start(input => {
  controller.handle(input);

  saveGame({
    character: state.character,
    progress: {
      level: state.character.level,
      experience: state.character.experience,
      gold: 0
    },
    world: {
      currentLocation: state.location,
      discoveredLocations: [state.location],
      activeQuests: [],
      discoveredNPCs: [],
      events: []
    },
    inventory: {
      items: state.inventory
    }
  });
});
