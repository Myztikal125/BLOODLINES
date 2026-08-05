import { Command } from "./command";
import { SaveManager } from "../../save/saveManager";
import { PlayerProgress } from "../../progression/playerProgress";
import { WorldState } from "../../world/state/worldState";
import { GameState } from "../gameState";
import { Inventory } from "../../inventory/inventory";

export class LoadCommand implements Command {

  name = "load";

  constructor(
    private saves: SaveManager,
    private progress: PlayerProgress,
    private world: WorldState,
    private state: GameState,
    private inventory: Inventory
  ) {}

  execute(): string {

    const data =
      this.saves.load();

    if (!data) {

      return `
No save file found.
`;

    }


    this.state.character =
      data.character;


    this.progress.level =
      data.progress.level;

    this.progress.experience =
      data.progress.experience;

    this.progress.gold =
      data.progress.gold;


    this.world.currentLocation =
      data.world.currentLocation;

    this.world.discoveredLocations =
      data.world.discoveredLocations;

    this.world.activeQuests =
      data.world.activeQuests;

    this.world.discoveredNPCs =
      data.world.discoveredNPCs;

    this.world.events =
      data.world.events;


    this.inventory.items =
      data.inventory?.items || [];


    return `
Game loaded.

Character:
${this.state.character.name}

Location:
${this.world.currentLocation}

Level:
${this.progress.level}

Experience:
${this.progress.experience}

Gold:
${this.progress.gold}
`;

  }

}
