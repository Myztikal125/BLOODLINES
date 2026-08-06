import { Command } from "./command";
import { GameState } from "../gameState";
import { WorldState } from "../../world/state/worldState";
import { QuestManager } from "../../world/quests/questManager";
import { QuestLoader } from "../../world/quests/questLoader";

export class ExploreCommand implements Command {

  name = "explore";

  constructor(
    private state: GameState,
    private world: WorldState,
    private quests: QuestManager
  ) {}

  execute(): string {

    const location =
      "Ruined Watchtower";

    this.world.discoverLocation(location);

    this.world.recordEvent(
      "Discovered ancient ruins in Ashenvale"
    );

    const quest =
      QuestLoader.getQuest(
        "lost_scholar"
      );

    if (quest) {

      quest.objectives[0].completed = true;

      this.quests.addQuest(
        quest
      );

    }

    return `
You explore ${this.state.location}.

The forest grows silent...

You discover:
${location}

Quest Started:
${quest?.title ?? "Unknown Quest"}

Objective:
${quest?.objectives[1]?.description ?? "Explore further."}
`;

  }

}
