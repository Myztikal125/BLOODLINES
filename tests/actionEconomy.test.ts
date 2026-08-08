import { describe, expect, it } from "vitest";
import { ActionEconomyState, StaminaResource } from "../engine/combat/actionEconomy";
import { ActionSlot } from "../engine/combat/combatAction";

describe("Action Economy", () => {
  it("allows one baseline Action per turn", () => {
    const state = new ActionEconomyState();

    expect(state.canUse(ActionSlot.Action)).toBe(true);
    state.consume(ActionSlot.Action);
    expect(state.canUse(ActionSlot.Action)).toBe(false);
    expect(() => state.consume(ActionSlot.Action)).toThrow();
  });

  it("allows a Bonus Action only when explicitly granted", () => {
    const state = new ActionEconomyState();

    expect(state.canUse(ActionSlot.BonusAction)).toBe(false);
    state.grantBonusAction();
    expect(state.canUse(ActionSlot.BonusAction)).toBe(true);
    state.consume(ActionSlot.BonusAction);
    expect(state.canUse(ActionSlot.BonusAction)).toBe(false);
  });

  it("allows a Reaction only when explicitly authorized and consumes it", () => {
    const state = new ActionEconomyState();

    expect(state.canUse(ActionSlot.Reaction)).toBe(false);
    state.authorizeReaction();
    expect(state.canUse(ActionSlot.Reaction)).toBe(true);
    state.consume(ActionSlot.Reaction);
    expect(state.canUse(ActionSlot.Reaction)).toBe(false);
  });

  it("resets turn slots without inventing stamina regeneration", () => {
    const state = new ActionEconomyState();
    state.grantBonusAction();
    state.authorizeReaction();
    state.consume(ActionSlot.Action);
    state.consume(ActionSlot.BonusAction);
    state.consume(ActionSlot.Reaction);

    state.startTurn();

    expect(state.canUse(ActionSlot.Action)).toBe(true);
    expect(state.canUse(ActionSlot.BonusAction)).toBe(false);
    expect(state.canUse(ActionSlot.Reaction)).toBe(false);
  });

  it("does not provide a stamina path to buy extra baseline slots", () => {
    const state = new ActionEconomyState();
    const stamina = new StaminaResource(100);

    state.consume(ActionSlot.Action);
    stamina.spend(1);

    expect(state.canUse(ActionSlot.Action)).toBe(false);
  });

  it("supports explicitly supplied stamina costs without defining any gameplay cost", () => {
    const stamina = new StaminaResource(10);

    expect(stamina.canSpend(3)).toBe(true);
    stamina.spend(3);
    expect(stamina.value).toBe(7);
    expect(stamina.canSpend(8)).toBe(false);
  });
});
