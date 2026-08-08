import fs from "fs";

export interface CompiledRuleSystem {
  system: string;
  status: "DEFINED" | "PARTIALLY_DEFINED" | "UNRESOLVED";
  approvedRules: string[];
  missingRules: string[];
  requiresHumanDecision: boolean;
}

export interface CompiledRules {
  systems: CompiledRuleSystem[];
  clarificationRequests: Array<{
    system: string;
    question: string;
    whyItMatters: string;
  }>;
  engineData: Record<string, unknown>;
  implementationRestrictions: string[];
}

const COMPILED_RULES_PATH = "data/rules/compiledRules.json";

export class RulesRuntime {
  private readonly rules: CompiledRules;

  constructor(filePath: string = COMPILED_RULES_PATH) {
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Compiled Rules data not found: ${filePath}. Run the Rules Bible compilation pipeline first.`
      );
    }

    const raw = fs.readFileSync(filePath, "utf8");
    this.rules = JSON.parse(raw) as CompiledRules;
    this.validate();
  }

  getAll(): CompiledRules {
    return this.rules;
  }

  getSystem(system: string): CompiledRuleSystem | undefined {
    return this.rules.systems.find(
      entry => entry.system.toLowerCase() === system.toLowerCase()
    );
  }

  isApproved(system: string): boolean {
    const entry = this.getSystem(system);
    return entry?.status === "DEFINED" || entry?.status === "PARTIALLY_DEFINED";
  }

  requiresHumanDecision(system: string): boolean {
    return this.getSystem(system)?.requiresHumanDecision ?? true;
  }

  private validate(): void {
    if (!Array.isArray(this.rules.systems)) {
      throw new Error("Compiled Rules are invalid: systems must be an array.");
    }

    for (const system of this.rules.systems) {
      if (!system.system || !Array.isArray(system.approvedRules)) {
        throw new Error(`Compiled Rules are invalid for system: ${system.system}`);
      }

      if (
        (system.status === "PARTIALLY_DEFINED" || system.status === "UNRESOLVED") &&
        !system.requiresHumanDecision
      ) {
        throw new Error(
          `Compiled Rules are invalid: ${system.system} requires a human decision.`
        );
      }
    }
  }
}
