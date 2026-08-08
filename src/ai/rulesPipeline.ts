import crypto from "crypto";
import fs from "fs";
import { compileRules } from "./rulesCompiler";

export const COMPILED_RULES_PATH = "data/rules/compiledRules.json";

/**
 * Compiles the current authoritative Rules Bible into validated runtime data.
 * The AI compiler may classify rules, but it is not allowed to invent mechanics.
 */
export async function compileRulesBible(
  rulesBiblePath = "docs/RULES_BIBLE.md"
): Promise<string> {
  if (!fs.existsSync(rulesBiblePath)) {
    throw new Error(`Rules Bible not found: ${rulesBiblePath}`);
  }

  const rulesBible = fs.readFileSync(rulesBiblePath, "utf8");
  const sourceBibleSha256 = crypto
    .createHash("sha256")
    .update(rulesBible, "utf8")
    .digest("hex");

  const raw = await compileRules(rulesBiblePath);

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      "Rules Compiler returned invalid JSON. Runtime rules were not updated."
    );
  }

  validateCompiledRules(parsed);

  const compiled = {
    ...parsed,
    sourceBibleSha256,
    compiledAt: new Date().toISOString()
  };

  fs.mkdirSync("data/rules", { recursive: true });
  fs.writeFileSync(
    COMPILED_RULES_PATH,
    `${JSON.stringify(compiled, null, 2)}\n`,
    "utf8"
  );

  return COMPILED_RULES_PATH;
}

function validateCompiledRules(value: unknown): asserts value is {
  systems: Array<{
    system: string;
    status: "DEFINED" | "PARTIALLY_DEFINED" | "UNRESOLVED";
    approvedRules: string[];
    missingRules: string[];
    requiresHumanDecision: boolean;
  }>;
  clarificationRequests: unknown[];
  engineData: Record<string, unknown>;
  implementationRestrictions: string[];
} {
  if (!value || typeof value !== "object") {
    throw new Error("Compiled Rules must be a JSON object.");
  }

  const data = value as Record<string, unknown>;

  if (!Array.isArray(data.systems)) {
    throw new Error("Compiled Rules must contain a systems array.");
  }

  for (const system of data.systems) {
    if (!system || typeof system !== "object") {
      throw new Error("Each compiled rule system must be an object.");
    }

    const entry = system as Record<string, unknown>;

    if (
      typeof entry.system !== "string" ||
      !["DEFINED", "PARTIALLY_DEFINED", "UNRESOLVED"].includes(
        entry.status as string
      ) ||
      !Array.isArray(entry.approvedRules) ||
      !Array.isArray(entry.missingRules) ||
      typeof entry.requiresHumanDecision !== "boolean"
    ) {
      throw new Error(`Invalid compiled rule system: ${String(entry.system)}`);
    }

    if (
      (entry.status === "PARTIALLY_DEFINED" || entry.status === "UNRESOLVED") &&
      entry.requiresHumanDecision !== true
    ) {
      throw new Error(
        `Invalid compiled rule system: ${String(entry.system)} must require a human decision.`
      );
    }
  }
}
