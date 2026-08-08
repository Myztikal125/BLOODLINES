import { Command } from "./command";
import { GameState } from "../gameState";
import { WorldState } from "../../world/state/worldState";
import { QuestManager } from "../../world/quests/questManager";
import { QuestLoader } from "../../world/quests/questLoader";
import { NPCLoader } from "../../world/npcs/npcLoader";
import { WorldLoader } from "../../world/worldLoader";

export class ExploreCommand implements Command {

  name = "explore";

  constructor(
    private state: GameState,
    private world: WorldState,
    private quests: QuestManager
  ) {}

  execute(): string {
    const currentLocation = this.state.location.toLowerCase();

    // Load world locations
    let worldData: any = null;

    try {
      worldData = WorldLoader.loadWorld();
    } catch (e) {}

    // Find undiscovered locations
    const discovered = this.world.discoveredLocations;

    const allLocations = worldData?.locations ?? ["Ruined Watchtower"];

    const undiscovered = allLocations.filter((l: any) => {
      const name = typeof l === "string" ? l : l.name;
      return !discovered.includes(name);
    });

    const nextLocation = undiscovered[0]
      ? (
          typeof undiscovered[0] === "string"
            ? undiscovered[0]
            : undiscovered[0].name
        )
      : allLocations[
          Math.floor(Math.random() * allLocations.length)
        ];

    this.world.discoverLocation(nextLocation);

    this.world.recordEvent(
      `Discovered ${nextLocation} in ${this.state.location}`
    );

    // Find NPCs in current location
    let npcs: any[] = [];

    try {
      const allNPCs = NPCLoader.loadNPCs();

      npcs = allNPCs.filter(
        (n: any) =>
          n.location?.toLowerCase() === currentLocation
      );
    } catch (e) {}

    // Start quest if available
    let questText = "";

    const quest = QuestLoader.getQuest("lost_scholar");

    const questAlreadyActive =
      this.quests
        .getActiveQuests()
        .some(q => q.id === "lost_scholar");

    if (quest && !questAlreadyActive) {
      this.quests.addQuest(quest);

      questText = `
Quest Started:
${quest.title}

Objective:
${quest.objectives[0]?.description ?? "Explore further."}`;
    }

    // NPC text
    const npcText = npcs.length > 0
      ? `
You encounter:
${npcs
  .map(
    (n: any) =>
      `${n.name} - ${n.role}`
  )
  .join("\n")}
(Type 'talk ${npcs[0].name
  .split(" ")[0]
  .toLowerCase()}' to speak with them)`
      : "";

    return `
You explore ${this.state.location}.

The forest grows silent...

You discover:
${nextLocation}
${npcText}
${questText}
`.trim();
  }
}
