import { Character } from "../characters/character";
import { WorldLoader } from "../world/worldLoader";
import { DungeonMaster } from "../ai/dungeonMaster";

export class GameSession {

  player?: Character;
  world: any;
  dm: DungeonMaster;

  constructor() {
    this.world = WorldLoader.loadWorld();
    this.dm = new DungeonMaster();
  }

  start(character: Character) {

    this.player = character;

    return this.dm.generateNarration({
      location: this.world.locations[0].name,
      players: [character.data.name],
      situation:
        "Your adventure begins."
    });
  }

  getWorld() {
    return this.world;
  }

  getPlayer() {
    return this.player;
  }
}
