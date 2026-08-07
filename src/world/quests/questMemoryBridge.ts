import { NPCService } from "../../npcs/npcService";
import { Quest } from "./questTypes";

export class QuestMemoryBridge {

  constructor(
    private npcService: NPCService
  ) {}

  questCompleted(
    quest: Quest,
    playerId: string
  ) {

    for (const npcId of quest.npcs) {

      this.npcService.rememberEvent(
        npcId,
        playerId,
        `Completed quest: ${quest.name}`,
        20
      );

      this.npcService.addKnownFact(
        npcId,
        playerId,
        `Helped complete ${quest.name}`
      );
    }
  }
}
