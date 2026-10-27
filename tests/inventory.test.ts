import { describe, expect, test } from "vitest";
import { Inventory } from "../engine/inventory/inventory";
import { AddItemCommand } from "../engine/game/commands/addItemCommand";
import { RemoveItemCommand } from "../engine/game/commands/removeItemCommand";

describe("Inventory expansion", () => {
  test("merges item stacks case-insensitively and preserves metadata", () => {
    const inventory = new Inventory();
    inventory.addItem({
      id: "health_potion",
      name: "Health Potion",
      type: "consumable",
      effect: "heal 2d4+2",
      quantity: 1
    });
    inventory.addItem("health potion", 2);

    expect(inventory.items).toHaveLength(1);
    expect(inventory.items[0]).toMatchObject({
      id: "health_potion",
      name: "health potion",
      type: "consumable",
      effect: "heal 2d4+2",
      quantity: 3
    });
  });

  test("removes part of a stack and removes the stack at zero", () => {
    const inventory = new Inventory();
    inventory.addItem("Torch", 5);

    expect(inventory.removeItem("torch", 2)).toBe(2);
    expect(inventory.items[0].quantity).toBe(3);
    expect(inventory.removeItem("Torch", 3)).toBe(3);
    expect(inventory.items).toHaveLength(0);
  });

  test("supports removing by item id and returns zero for unknown items", () => {
    const inventory = new Inventory();
    inventory.addItem({ id: "shortbow", name: "Shortbow", quantity: 1 });

    expect(inventory.removeItem("SHORTBOW")).toBe(1);
    expect(inventory.removeItem("missing")).toBe(0);
  });

  test("rejects invalid quantities without mutating inventory", () => {
    const inventory = new Inventory();
    expect(() => inventory.addItem("Potion", 0)).toThrow(RangeError);
    inventory.addItem("Potion", 2);
    expect(() => inventory.removeItem("Potion", -1)).toThrow(RangeError);
    expect(inventory.items[0].quantity).toBe(2);
  });

  test("commands accept explicit stack quantities", () => {
    const inventory = new Inventory();
    const add = new AddItemCommand(inventory);
    const remove = new RemoveItemCommand(inventory);

    expect(add.execute(["4", "Health", "Potion"])).toContain("4");
    expect(inventory.items[0].quantity).toBe(4);
    expect(remove.execute(["2", "Health", "Potion"])).toContain("2");
    expect(inventory.items[0].quantity).toBe(2);
  });

  test("lists useful item metadata", () => {
    const inventory = new Inventory();
    inventory.addItem({
      id: "iron_sword",
      name: "Iron Sword",
      type: "weapon",
      rarity: "common",
      damage: "1d8",
      value: 25,
      quantity: 1
    });

    expect(inventory.list()).toContain("Damage 1d8");
    expect(inventory.list()).toContain("Value 25");
  });
});
