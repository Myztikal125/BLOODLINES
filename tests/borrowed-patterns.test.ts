import { describe, expect, it } from "vitest";
import { EventBus } from "../src/engine/events/eventBus";
import { applyModifiers, deriveStats } from "../src/engine/rules/modifierEngine";
import { ToolRegistry } from "../src/ai/toolContracts";

describe("deterministic modifier engine", () => {
  it("applies modifiers in stable priority order", () => {
    const result = applyModifiers({ armorClass: 10 }, [
      { id: "late", source: "ring", target: "armorClass", operation: "add", value: 2, priority: 20 },
      { id: "base", source: "shield", target: "armorClass", operation: "add", value: 3, priority: 10 },
    ]);

    expect(result.armorClass).toBe(15);
  });

  it("derives a stat and clamps the result", () => {
    const result = deriveStats(
      { constitution: 14 },
      [{ stat: "hitPoints", base: "constitution", clamp: { min: 1, max: 20 } }],
      [{ id: "tough", source: "feat", target: "hitPoints", operation: "add", value: 10 }],
    );

    expect(result.hitPoints).toBe(20);
  });
});

describe("typed event bus", () => {
  it("delivers events and supports unsubscribe", () => {
    const bus = new EventBus();
    const received: string[] = [];
    const unsubscribe = bus.on("combat.started", event => received.push(event.encounterId));

    bus.emit("combat.started", { encounterId: "enc-1" });
    unsubscribe();
    bus.emit("combat.started", { encounterId: "enc-2" });

    expect(received).toEqual(["enc-1"]);
  });
});

describe("AI tool contracts", () => {
  it("does not allow execution of an unregistered tool", async () => {
    const registry = new ToolRegistry();
    await expect(registry.execute("missing", {})).rejects.toThrow("Unknown tool: missing");
  });

  it("validates required arguments before execution", async () => {
    const registry = new ToolRegistry();
    registry.register({
      name: "damage",
      description: "Apply damage",
      properties: { amount: { type: "integer" } },
      required: ["amount"],
      execute: ({ amount }) => amount,
    });

    await expect(registry.execute("damage", {})).rejects.toThrow("Missing required argument 'amount'");
    await expect(registry.execute("damage", { amount: 7 })).resolves.toBe(7);
  });
});
