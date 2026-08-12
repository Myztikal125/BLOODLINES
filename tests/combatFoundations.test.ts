import { describe, expect, it } from "vitest";
import { CombatRoundLifecycle, COMBAT_ROUND_DURATION_SECONDS } from "../src/engine/combat/combatRound";
import { CombatController } from "../src/engine/combat/combatController";
import { RestType } from "../src/engine/combat/rest";

describe("Combat foundations", () => {
  it("represents discrete six-second rounds", () => {
    const lifecycle = new CombatRoundLifecycle();

    expect(COMBAT_ROUND_DURATION_SECONDS).toBe(6);
    expect(lifecycle.start()).toEqual(expect.objectContaining({ number: 1, durationSeconds: 6 }));
    expect(lifecycle.advance()).toEqual(expect.objectContaining({ number: 2, durationSeconds: 6 }));
  });

  it("tracks rest lifecycle states without recovery effects", () => {
    const controller = new CombatController();

    expect(controller.beginRest(RestType.ShortRest)).toBe(RestType.ShortRest);
    expect(controller.getCurrentRest()).toBe(RestType.ShortRest);
    controller.endRest();
    expect(controller.getCurrentRest()).toBeUndefined();

    expect(controller.beginRest(RestType.LongRest)).toBe(RestType.LongRest);
    expect(controller.getCurrentRest()).toBe(RestType.LongRest);
  });
});
