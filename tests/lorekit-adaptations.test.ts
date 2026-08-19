import { describe, expect, it } from "vitest";
import { buildDmSystemPrompt } from "../src/dm/dmGuidelines";
import { GameSession } from "../src/dm/gameSession";
import { MemoryStore } from "../src/npcs/memory/memoryStore";
import { evaluateDerivedRules } from "../src/engine/rules/formulaEngine";
import { Timeline } from "../src/world/timeline";
import { CheckpointStore } from "../src/world/checkpoints";

describe("BLOODLINES DM layer", () => {
  it("requires engine-authoritative mechanics", () => {
    expect(buildDmSystemPrompt()).toContain("Never invent mechanical results");
  });

  it("replays session history to new subscribers", () => {
    const session = new GameSession();
    session.start();
    const received: string[] = [];
    session.subscribe(event => received.push(event.content));
    expect(received).toContain("BLOODLINES session started.");
  });
});

describe("derived formula evaluation", () => {
  it("resolves dependencies before dependent rules", () => {
    const result = evaluateDerivedRules(
      { strength: 16 },
      [
        { id: "modifier", dependsOn: ["strength"], evaluate: ctx => Math.floor((ctx.strength - 10) / 2) },
        { id: "attack", dependsOn: ["modifier"], evaluate: ctx => ctx.strength + ctx.modifier },
      ],
    );
    expect(result.attack).toBe(19);
  });

  it("rejects circular dependencies", () => {
    expect(() => evaluateDerivedRules({}, [
      { id: "a", dependsOn: ["b"], evaluate: ctx => ctx.b },
      { id: "b", dependsOn: ["a"], evaluate: ctx => ctx.a },
    ])).toThrow("Circular derived-stat dependency");
  });
});

describe("NPC memory", () => {
  it("prioritizes important relevant memories", () => {
    const store = new MemoryStore();
    store.add({ id: "old", npcId: "lyra", type: "event", content: "A distant storm", importance: 1, createdAt: 1, accessCount: 0, entities: [] });
    store.add({ id: "relevant", npcId: "lyra", type: "relationship", content: "Shadow saved Lyra", importance: 8, createdAt: Date.now(), accessCount: 0, entities: ["shadow"] });
    expect(store.recall({ npcId: "lyra", query: "Shadow", entityIds: ["shadow"], limit: 1 })[0].id).toBe("relevant");
  });
});

describe("timeline and checkpoints", () => {
  it("supports branching", () => {
    const timeline = new Timeline();
    timeline.append("quest.choice", { choice: "left" });
    timeline.fork("alternate");
    timeline.append("quest.choice", { choice: "right" });
    expect(timeline.getActiveBranch()).toBe("alternate");
  });

  it("stores and retrieves typed checkpoints", () => {
    const store = new CheckpointStore<{ hp: number }>();
    store.save("save-1", "Before boss", { hp: 10 });
    expect(store.load("save-1").state.hp).toBe(10);
  });
});
