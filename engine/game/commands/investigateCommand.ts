import { Command } from "./command";
import { WorldState } from "../../world/state/worldState";
import { QuestManager } from "../../world/quests/questManager";

export class InvestigateCommand implements Command {

  name = "investigate";

  constructor(
    private world: WorldState,
    private quests: QuestManager
  ) {}

  execute(): string {

    if (
      !this.world.discoveredLocations.includes(
        "Ruined Watchtower"
      )
    ) {
      return "There is nothing nearby to investigate.";
    }

    this.world.recordEvent(
      "Investigated the Ruined Watchtower"
    );

    this.quests.completeObjective(
      "lost_scholar",
      "investigate_watchtower"
    );

    return `
You investigate the Ruined Watchtower...

You uncover:
- Torn scholar notes
- Strange magical markings
- A hidden passage beneath the ruins

Quest Progress:
The Lost Scholar

Completed:
Investigate the scholar's research

New Objective:
Find the missing scholar.
`;
  }

}
