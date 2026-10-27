import { afterEach, describe, expect, test, vi } from "vitest";
import { EncounterGenerator } from "../engine/combat/encounters/encounterGenerator";
import { MonsterLoader } from "../engine/combat/encounters/monsterLoader";

describe("Bloodlines Encounter Generator", () => {
  afterEach(() => vi.restoreAllMocks());

  test("creates an encounter with the requested difficulty", () => {
    const encounter = EncounterGenerator.generate(1, 4, "medium");
    expect(encounter.monsters.length).toBeGreaterThan(0);
    expect(encounter.difficulty).toBe("medium");
  });

  test("uses party level to exclude monsters above the challenge ceiling", () => {
    const encounter = EncounterGenerator.generate(1, 4, "deadly");
    expect(encounter.monsters.length).toBe(4);
    expect(encounter.monsters.every(monster => monster.challenge <= 1)).toBe(true);
  });

  test("selects distinct monsters when the eligible catalogue is large enough", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const encounter = EncounterGenerator.generate(4, 4, "deadly");
    const ids = encounter.monsters.map(monster => monster.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("rejects invalid party levels and sizes", () => {
    expect(() => EncounterGenerator.generate(0, 4, "medium")).toThrow(RangeError);
    expect(() => EncounterGenerator.generate(1, 0, "medium")).toThrow(RangeError);
  });

  test("monster catalogue includes varied types and behavior notes", () => {
    const monsters = MonsterLoader.loadMonsters();
    expect(monsters.length).toBeGreaterThanOrEqual(10);
    expect(new Set(monsters.map((monster: any) => monster.type)).size).toBeGreaterThanOrEqual(4);
    expect(monsters.some((monster: any) => typeof monster.tactics === "string")).toBe(true);
  });
});
