import { describe, expect, test } from "vitest";
import { RulesetManager } from "../engine/rules/rulesetManager";

describe("Bloodlines Ruleset Manager", () => {

  test("defaults to Bloodlines ruleset", () => {

    const manager = new RulesetManager();

    expect(manager.getCurrent().name)
      .toBe("Bloodlines");

  });

  test("can switch rulesets", () => {

    const manager = new RulesetManager();

    manager.switchRuleset("dnd2014");

    expect(manager.getCurrent().name)
      .toBe("D&D 2014");

  });

});
