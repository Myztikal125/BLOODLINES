import { describe, expect, it } from "vitest";
import { createCharacter } from "../src/engine/characterFactory";

describe("Lyra Vey companion foundation", () => {
  it("creates Lyra with the locked character foundation", () => {
    const lyra = createCharacter({
      name: "Lyra Vey",
      ancestry: "human",
      background: "scholar",
      classId: "wizard",
      level: 1,
      abilities: {
        strength: 8,
        dexterity: 12,
        constitution: 10,
        intelligence: 16,
        wisdom: 13,
        charisma: 11,
      },
      hitPoints: 7,
      armorClass: 10,
      stamina: 10,
      proficiencyBonus: 2,
    });

    expect(lyra.name).toBe("Lyra Vey");
    expect(lyra.ancestry).toBe("human");
    expect(lyra.background).toBe("scholar");
    expect(lyra.class.id).toBe("wizard");
    expect(lyra.level).toBe(1);
    expect(lyra.abilities).toEqual({
      strength: 8,
      dexterity: 12,
      constitution: 10,
      intelligence: 16,
      wisdom: 13,
      charisma: 11,
    });
    expect(lyra.hitPoints).toBe(7);
    expect(lyra.armorClass).toBe(10);
    expect(lyra.stamina).toBe(10);
    expect(lyra.proficiencyBonus).toBe(2);
    expect(lyra.bloodlineIds).toEqual([]);
  });
});
