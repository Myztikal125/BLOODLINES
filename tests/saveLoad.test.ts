import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { SaveManager, SaveData } from "../engine/save/saveManager";
import { GameController } from "../engine/game/gameController";
import { CombatController } from "../engine/combat/combatController";
import { NPCService } from "../src/npcs/npcService";
import { RelationshipService } from "../src/npcs/relationships/relationshipService";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function makeSave(): SaveData {
  return {
    character: { name: "Shadow", level: 4, experience: 1200 },
    progress: { level: 4, experience: 1200, gold: 75 },
    world: {
      currentLocation: "Ruined Watchtower",
      discoveredLocations: ["Ashenvale", "Ruined Watchtower"],
      activeQuests: ["lost_scholar"],
      discoveredNPCs: ["keeper"],
      events: ["Opened the old gate"]
    },
    inventory: { items: [{ name: "Health Potion", quantity: 2 }] }
  };
}

describe("SaveManager", () => {
  test("returns null when no save file exists", () => {
    const dir = mkdtempSync(join(tmpdir(), "bloodlines-save-"));
    tempDirs.push(dir);
    const saves = new SaveManager(join(dir, "savegame.json"));

    expect(saves.load()).toBeNull();
  });

  test("round-trips the complete campaign snapshot", () => {
    const dir = mkdtempSync(join(tmpdir(), "bloodlines-save-"));
    tempDirs.push(dir);
    const saves = new SaveManager(join(dir, "savegame.json"));
    const expected = makeSave();

    saves.save(expected);

    expect(saves.load()).toEqual(expected);
  });
});

describe("startup save restoration", () => {
  test("hydrates progress, world, and inventory from the loaded save", () => {
    const save = makeSave();
    const state = {
      character: save.character,
      location: save.world.currentLocation,
      inventory: save.inventory.items
    };

    const controller = new GameController(
      state,
      new CombatController(),
      new NPCService(),
      new RelationshipService(),
      undefined,
      save
    );

    const runtime = controller as any;
    expect(runtime.progress).toMatchObject(save.progress);
    expect(runtime.world).toMatchObject(save.world);
    expect(runtime.inventory.items).toEqual(save.inventory.items);
    expect(state.location).toBe(save.world.currentLocation);
  });
});
