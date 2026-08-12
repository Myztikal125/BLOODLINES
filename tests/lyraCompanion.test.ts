import { describe, expect, it } from "vitest";
import { CompanionService } from "../src/companions/companionService";
import { NPCService } from "../src/npcs/npcService";

describe("Lyra Vey companion", () => {
  it("constructs Lyra through the real character and NPC systems", () => {
    const npcService = new NPCService();
    const companionService = new CompanionService(npcService);
    const lyra = companionService.load("lyra_vey");

    expect(lyra.character.name).toBe("Lyra Vey");
    expect(lyra.character.level).toBe(1);
    expect(lyra.character.ancestry).toBe("human");
    expect(lyra.character.background).toBe("scholar");
    expect(lyra.character.class.id).toBe("wizard");
    expect(lyra.character.abilities).toEqual({
      strength: 8,
      dexterity: 12,
      constitution: 10,
      intelligence: 16,
      wisdom: 13,
      charisma: 11
    });
    expect(lyra.character.hitPoints).toBe(7);
    expect(lyra.character.armorClass).toBe(10);
    expect(lyra.character.stamina).toBe(10);
    expect(lyra.character.proficiencyBonus).toBe(2);
    expect(lyra.character.bloodlineIds).toEqual([]);

    expect(lyra.character.class.startingSpells).toEqual([
      "firebolt",
      "magic_missile",
      "shield",
      "detect_magic"
    ]);
    expect(lyra.character.class.abilities).toContain("magical_research");

    expect(lyra.npc.id).toBe("lyra_vey");
    expect(lyra.npc.personality?.traits).toEqual([
      "curious",
      "driven",
      "analytical"
    ]);
    expect(lyra.npc.personality?.values).toEqual([
      "knowledge",
      "discovery",
      "truth"
    ]);
    expect(lyra.recruitmentState).toBe("unrecruited");
  });

  it("enforces the approved Lyra recruitment requirements", () => {
    const service = new CompanionService(new NPCService());

    expect(
      service.canRecruitLyra({
        rescuedLyra: false,
        shadowHuntsBloodglassSecrets: false
      })
    ).toBe(false);

    expect(
      service.canRecruitLyra({
        rescuedLyra: true,
        shadowHuntsBloodglassSecrets: true
      })
    ).toBe(false);

    expect(
      service.canRecruitLyra({
        rescuedLyra: true,
        shadowHuntsBloodglassSecrets: false
      })
    ).toBe(true);

    const lyra = service.recruitLyra({
      rescuedLyra: true,
      shadowHuntsBloodglassSecrets: false
    });

    expect(lyra.recruitmentState).toBe("recruited");
  });
});
