import { describe, expect, it } from "vitest";
import { CompanionService, LYRA_ID } from "../src/companions/companionService";
import { NPCService } from "../src/npcs/npcService";

describe("Lyra Vey companion integration", () => {
  it("registers Lyra through the existing NPC system", () => {
    const npcService = new NPCService();
    const companionService = new CompanionService(npcService);

    const lyra = companionService.getLyra();
    const npc = npcService.getById(LYRA_ID);

    expect(lyra.recruitmentState).toBe("unrecruited");
    expect(npc).toBeDefined();
    expect(npc?.name).toBe("Lyra Vey");
    expect(npc?.identity).toEqual({
      ancestry: "human",
      class: "wizard",
      background: "scholar"
    });
    expect(npc?.personality?.traits).toEqual(["curious", "driven", "analytical"]);
    expect(npc?.personality?.values).toEqual(["knowledge", "discovery", "truth"]);
  });

  it("uses the approved recruitment gate", () => {
    const companionService = new CompanionService(new NPCService());

    expect(companionService.canRecruitLyra(false, false)).toBe(false);
    expect(companionService.canRecruitLyra(true, true)).toBe(false);
    expect(companionService.canRecruitLyra(true, false)).toBe(true);
  });

  it("recruits Lyra only when both requirements are satisfied", () => {
    const companionService = new CompanionService(new NPCService());

    const lyra = companionService.recruitLyra(true, false);

    expect(lyra.recruitmentState).toBe("recruited");
    expect(lyra.character.name).toBe("Lyra Vey");
    expect(lyra.character.bloodlineIds).toEqual([]);
  });
});
