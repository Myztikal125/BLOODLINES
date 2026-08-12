import { createCharacter } from "../engine/characterFactory";
import { NPCService, NPC } from "../npcs/npcService";
import { Companion, CompanionDefinition } from "./types";

const LYRA_ID = "LYRA_VEY";

const lyraDefinition: CompanionDefinition = {
  id: LYRA_ID,
  name: "Lyra Vey",
  role: "Arcane investigator",
  identity: {
    ancestry: "human",
    class: "wizard",
    background: "scholar"
  },
  focus: {
    combat: "Arcane Damage",
    utility: "Investigation"
  },
  personality: {
    traits: ["curious", "driven", "analytical"],
    values: ["knowledge", "discovery", "truth"]
  },
  story: {
    hook: "Bloodglass Sanctum disappearance"
  },
  recruitment: {
    requirements: [
      "Rescue Lyra",
      "Prove Shadow is not hunting the Bloodglass secrets"
    ]
  },
  character: {
    level: 1,
    bloodlineIds: [],
    abilities: {
      strength: 8,
      dexterity: 12,
      constitution: 10,
      intelligence: 16,
      wisdom: 13,
      charisma: 11
    },
    hitPoints: 7,
    armorClass: 10,
    stamina: 10,
    proficiencyBonus: 2
  }
};

function createLyraCharacter() {
  return createCharacter({
    name: lyraDefinition.name,
    classId: "wizard",
    level: lyraDefinition.character.level,
    bloodlineIds: lyraDefinition.character.bloodlineIds,
    ancestry: lyraDefinition.identity.ancestry,
    background: lyraDefinition.identity.background,
    abilities: lyraDefinition.character.abilities,
    hitPoints: lyraDefinition.character.hitPoints,
    armorClass: lyraDefinition.character.armorClass,
    stamina: lyraDefinition.character.stamina,
    proficiencyBonus: lyraDefinition.character.proficiencyBonus
  });
}

function createLyraNPC(): NPC {
  return {
    id: LYRA_ID,
    name: lyraDefinition.name,
    role: lyraDefinition.role,
    identity: {
      ancestry: lyraDefinition.identity.ancestry,
      class: lyraDefinition.identity.class,
      background: lyraDefinition.identity.background
    },
    personality: {
      traits: [...lyraDefinition.personality.traits],
      values: [...lyraDefinition.personality.values]
    }
  };
}

export class CompanionService {
  private companions = new Map<string, Companion>();

  constructor(private readonly npcService: NPCService) {}

  registerLyra(): Companion {
    const existing = this.companions.get(LYRA_ID);
    if (existing) return existing;

    const companion: Companion = {
      definition: lyraDefinition,
      character: createLyraCharacter(),
      npc: createLyraNPC(),
      recruitmentState: "unrecruited"
    };

    this.npcService.load([companion.npc]);
    this.companions.set(LYRA_ID, companion);

    return companion;
  }

  getById(id: string): Companion | undefined {
    return this.companions.get(id);
  }

  getLyra(): Companion {
    return this.registerLyra();
  }

  canRecruitLyra(rescuedLyra: boolean, huntingBloodglassSecrets: boolean): boolean {
    return rescuedLyra && !huntingBloodglassSecrets;
  }

  recruitLyra(rescuedLyra: boolean, huntingBloodglassSecrets: boolean): Companion {
    const lyra = this.getLyra();

    if (!this.canRecruitLyra(rescuedLyra, huntingBloodglassSecrets)) {
      throw new Error("Lyra cannot be recruited yet");
    }

    lyra.recruitmentState = "recruited";
    return lyra;
  }
}

export { LYRA_ID, lyraDefinition };
