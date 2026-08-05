import { Command } from "./command";
import { GameState } from "../gameState";
import { WorldState } from "../../world/state/worldState";
import { QuestManager } from "../../world/quests/questManager";
import { Quest } from "../../world/quests/quest";

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

    const quest: Quest = {

      id: "lost-scholar",

      title: "The Lost Scholar",

      description:
        "Find the missing scholar inside the Ruined Watchtower.",

      objectives: [
        {
          id: "discover-watchtower",
          description:
            "Discover the Ruined Watchtower.",
          completed: true
        },
        {
          id: "find-scholar",
          description:
            "Find the missing scholar.",
          completed: false
        }
      ],

      completed: false,

      rewards: {
        experience: 100,
        gold: 50
      }

    };


    this.quests.addQuest(
      quest
    );


    return `
You explore ${this.state.location}.

The forest grows silent...

You discover:
${location}

Quest Started:
${quest.title}

Objective:
${quest.objectives[1].description}
`;

  }

}
