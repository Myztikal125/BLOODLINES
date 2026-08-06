import { describe, it, expect } from "vitest";
import { createCharacter } from "../src/engine/characterFactory";

describe("Wizard Character", () => {
  it("creates a level 1 wizard", () => {
    const wizard = createCharacter({
      name: "Gandalf",
      classId: "wizard",
      bloodlineIds: [],
    });

    expect(wizard.class.id).toBe("wizard");
    expect(wizard.class.signatureSpellSlots).toBe(1);
    expect(wizard.class.startingSpells).toContain("firebolt");
    expect(wizard.class.abilities).toContain("spellbook");
  });

  it("creates a level 3 wizard", () => {
    const wizard = createCharacter({
      name: "Merlin",
      classId: "wizard",
      bloodlineIds: [],
      level: 3,
    });

    expect(wizard.class.signatureSpellSlots).toBe(2);
    expect(wizard.class.abilities).toContain("arcane_specialization");
  });

  it("creates a level 5 wizard", () => {
    const wizard = createCharacter({
      name: "Morgana",
      classId: "wizard",
      bloodlineIds: [],
      level: 5,
    });

    expect(wizard.class.signatureSpellSlots).toBe(3);
    expect(wizard.class.abilities).toContain("advanced_spellcrafting");
  });
});
