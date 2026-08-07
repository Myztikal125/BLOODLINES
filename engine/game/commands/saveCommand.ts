import { Command } from "./command";
import { SaveManager } from "../../save/saveManager";
import { PlayerProgress } from "../../progression/playerProgress";
import { WorldState } from "../../world/state/worldState";
import { GameState } from "../gameState";
import { Inventory } from "../../inventory/inventory";

export class SaveCommand implements Command {

  name = "save";

  constructor(
    private saves: SaveManager,
    private progress: PlayerProgress,
    private world: WorldState,
    private state: GameState,
    private inventory: Inventory
  ) {}

  execute(): string {

    this.saves.save({

      character: {
        ...this.state.character,
        experience: this.progress.experience
      },

      progress: {
        level: this.progress.level,
        experience: this.progress.experience,
        gold: this.progress.gold
      },

      world: {

        currentLocation:
          this.world.currentLocation,

        discoveredLocations:
          this.world.discoveredLocations,

        activeQuests:
          this.world.activeQuests,

        discoveredNPCs:
          this.world.discoveredNPCs,

        events:
          this.world.events

      },

      inventory: {
        items: this.inventory.items.map(item => ({
          name: item.name,
          quantity: item.quantity ?? 1
        }))
      }

    });


    return `
Game saved.

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
