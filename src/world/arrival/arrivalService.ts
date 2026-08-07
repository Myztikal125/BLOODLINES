import { NPCService } from "../../npcs/npcService";
import { NPCMemoryService } from "../../npcs/npcMemory";

export class ArrivalService {

  constructor(
    private npcService: NPCService,
    private memoryService: NPCMemoryService
  ) {}

  arrive(
    playerId: string,
    location: string
  ) {

    console.log(
      `${playerId} arrives at ${location}`
    );

    const npcs =
      this.npcService.getByLocation(location);

    console.log(
      `Nearby NPCs detected: ${npcs.length}`
    );

    for (const npc of npcs) {

      this.memoryService.addMemory(
        npc.id,
        playerId,
        `${playerId} arrived in ${location}. First meeting recorded.`,
        0
      );
    }

    return {
      playerId,
      location,
      nearbyNPCs: npcs.map(npc => npc.id),
      scene:
        `The journey begins in ${location}.`
    };
  }
}
