import { describe, expect, test } from "vitest";
import { Equipment } from "../engine/inventory/equipment";

describe("Bloodlines Equipment", () => {

  test("equips an item", () => {

    const equipment = new Equipment();

    equipment.equip(
      "mainHand",
      {
        id: "iron_sword",
        name: "Iron Sword",
        type: "weapon",
        damage: "1d8",
        value: 25
      }
    );

    expect(
      equipment.getEquipment().mainHand?.name
    ).toBe("Iron Sword");

  });

});
