export type Ruleset = "dnd2014" | "dnd2024" | "bloodlines";

export interface RuleSetConfig {
  name: string;
  description: string;
}

const rulesets: Record<Ruleset, RuleSetConfig> = {
  dnd2014: {
    name: "D&D 2014",
    description: "Classic fifth edition rules."
  },

  dnd2024: {
    name: "D&D 2024",
    description: "Updated fifth edition rules."
  },

  bloodlines: {
    name: "Bloodlines",
    description: "Custom hybrid rules combining 2014 and 2024 systems."
  }
};

export class RulesetManager {
  private current: Ruleset;

  constructor(initial: Ruleset = "bloodlines") {
    this.current = initial;
  }

  getCurrent(): RuleSetConfig {
    return rulesets[this.current];
  }

  switchRuleset(rule: Ruleset): void {
    this.current = rule;
  }
}
