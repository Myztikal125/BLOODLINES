import { Command } from "./command";
import { WorldState } from "../../world/state/worldState";

export class WorldCommand implements Command {

  name = "world";

  constructor(
    private world: WorldState
  ) {}

  execute(): string {

    return `
Current Location:
${this.world.currentLocation}

Discovered:
${this.world.discoveredLocations.join(", ")}

Active Quests:
${this.world.activeQuests.length}

Events:
${this.world.events.length}
`;

  }

}
