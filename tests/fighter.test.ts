import { describe, it, expect } from "vitest";
import { createCharacter } from "../src/engine/characterFactory";

describe("Fighter Character", () => {
  it("creates a level 1 fighter", () => {
    const fighter = createCharacter({
      name: "Conan",
      classId: "fighter",
      level: 1
    });

    expect(fighter.class.id).toBe("fighter");
    expect(fighter.class.abilities).toContain("weapon_mastery");
    expect(fighter.class.abilities).toContain("second_wind");
  });

  it("creates a level 3 fighter", () => {
    const fighter = createCharacter({
      name: "Conan",
      classId: "fighter",
      level: 3
    });

    expect(fighter.class.abilities).toContain("martial_specialization");
  });

  it("creates a level 5 fighter", () => {
    const fighter = createCharacter({
      name: "Conan",
      classId: "fighter",
      level: 5
    });

    expect(fighter.class.abilities).toContain("extra_attack");
  });
});
