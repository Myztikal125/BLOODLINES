import { createCharacter } from "../engine/characterFactory";
import { loadData } from "../engine/dataLoader";
import { NPCService } from "../npcs/npcService";
import { Companion, CompanionDefinition } from "./types";

export interface LyraRecruitmentContext {
  rescuedLyra: boolean;
  shadowHuntsBloodglassSecrets: boolean;
}

export class CompanionService {
  private companions = new Map<string, Companion>();

  constructor(private npcService: NPCService) {}

  load(id: string): Companion {
    const definition = loadData("companions", id) as CompanionDefinition;

    if (!definition) {
      throw new Error(`Companion not found: ${id}`);
    }

    const character = createCharacter({
      name: definition.name,
      classId: definition.identity.class,
      level: definition.character.level,
      bloodlineIds: definition.character.bloodlineIds,
      ancestry: definition.identity.ancestry,
      background: definition.identity.background,
      abilities: definition.character.abilities,
      hitPoints: definition.character.hitPoints,
      armorClass: definition.character.armorClass,
      stamina: definition.character.stamina,
      proficiencyBonus: definition.character.proficiencyBonus
    });

    this.npcService.load([
      {
        id: definition.id,
        name: definition.name,
        role: definition.role,
        identity: definition.identity,
        personality: definition.personality,
        questHooks: [definition.story.hook]
      }
    ]);

    const npc = this.npcService.getById(definition.id);

    if (!npc) {
      throw new Error(`Failed to register companion NPC: ${definition.id}`);
    }

    const companion: Companion = {
      definition,
      character,
      npc,
      recruitmentState: "unrecruited"
    };

    this.companions.set(definition.id, companion);

    return companion;
  }

  getById(id: string): Companion | undefined {
    return this.companions.get(id);
  }

  canRecruitLyra(context: LyraRecruitmentContext): boolean {
    return context.rescuedLyra && !context.shadowHuntsBloodglassSecrets;
  }

  recruitLyra(context: LyraRecruitmentContext): Companion {
    if (!this.canRecruitLyra(context)) {
      throw new Error("Lyra Vey cannot be recruited under the current requirements.");
    }

    const companion = this.getById("lyra_vey") ?? this.load("lyra_vey");
    companion.recruitmentState = "recruited";

    return companion;
  }
}
