import "dotenv/config";

import { GameRunner } from "../engine/game/gameRunner";
import { TerminalInterface } from "./interface/terminal";
import { GameController } from "../engine/game/gameController";
import { CombatController } from "../engine/combat/combatController";
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

  player = {
    data: saved.character
  };

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


const npcService =
  new NPCService();

const personalityService =
  new PersonalityService();

const relationshipService =
  new RelationshipService();


const worldInitializer =
  new WorldInitializer(
    npcService,
    personalityService,
    relationshipService
  );


const worldData =
  loadData("world", "world");

const npcData =
  loadData("npcs", "npcs");


worldInitializer.initialize(
  worldData,
  npcData
);


const state = {

  character: player.data,

  location:
    saved?.world?.currentLocation ??
    "Ashenvale",

  inventory:
    saved?.inventory?.items ?? []

};


const combat =
  new CombatController();


const controller =
  new GameController(
    state,
    combat,
    npcService,
    relationshipService
  );


const terminal =
  new TerminalInterface();


terminal.start(input => {

  controller.handle(input);


  saveGame({

    character:
      state.character,

    progress: {

      level:
        state.character.level,

      experience:
        state.character.experience,

      gold: 0

    },


    world: {

      currentLocation:
        state.location,

      discoveredLocations: [
        state.location
      ],

      activeQuests: [],

      discoveredNPCs: [],

      events: []

    },


    inventory: {

      items:
        state.inventory

    }

  });

});
