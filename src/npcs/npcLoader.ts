import { NPCService } from "./npcService";
import { PersonalityService } from "./personality/personalityService";

export class NPCLoader {

  constructor(
    private npcService: NPCService,
    private personalityService: PersonalityService
  ) {}

  loadNPC(npcData: any) {

    this.npcService.load([
      {
        id: npcData.id,
        name: npcData.name,
        role: npcData.identity?.role,
        location: npcData.identity?.location,
        faction: npcData.identity?.faction,
        trust: npcData.stateVariables?.trust ?? 0,
        quests: npcData.questHooks ?? []
      }
    ]);

    if (npcData.personality) {

      this.personalityService.add({
        npcId: npcData.id,
        traits: npcData.personality.traits ?? [],
        values: npcData.personality.values ?? [],
        flaws: npcData.personality.flaws ?? [],
        humor: npcData.personality.humor ?? "",
        speechStyle: npcData.personality.speechStyle ?? "",
        temperament: npcData.personality.temperament ?? "",
        fears: npcData.psychology?.fears ?? [],
        motivations: npcData.psychology?.motivations ?? []
      });

    }

    return this.npcService.getById(
      npcData.id
    );
  }
}
