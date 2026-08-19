export type RulesVersion = "bloodlines" | "dnd2014" | "dnd2024";

export interface RuleSource {
  id: string;
  name: string;
  version: RulesVersion;
  license?: string;
  attribution?: string;
}

export interface RuleContext {
  primary: RulesVersion;
  fallbacks: RulesVersion[];
  sources: RuleSource[];
}

export const DEFAULT_BLOODLINES_RULE_CONTEXT: RuleContext = {
  primary: "bloodlines",
  fallbacks: ["dnd2024", "dnd2014"],
  sources: [],
};

export function resolveRuleVersion(primary: RulesVersion, available: RulesVersion[]): RulesVersion | undefined {
  if (available.includes(primary)) return primary;
  if (primary === "bloodlines" && available.includes("dnd2024")) return "dnd2024";
  if (available.includes("dnd2014")) return "dnd2014";
  return undefined;
}
