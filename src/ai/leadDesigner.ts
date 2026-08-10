import fs from "fs";
import { askAI } from "./aiClient";

import { readRulesBible } from "./implementationAssistant";
import { SUPERPOWERS_DESIGN_SKILLS } from "./skills/superpowers";


export type LeadDesignerDecision = "IMPLEMENT_REQUIRED" | "NO_CHANGE_REQUIRED" | "APPROVED" | "APPROVED_WITH_MODIFICATIONS" | "REJECTED" | "DEFERRED" | "BLOCKED" | "HUMAN_DECISION_REQUIRED";
export type DesignProposalStatus = "PROPOSED" | "UNDER_REVIEW" | "APPROVED" | "APPROVED_WITH_MODIFICATIONS" | "REJECTED" | "DEFERRED" | "IMPLEMENTED";
export interface DesignProposal { id: string; assistant: string; system: string; proposal: string; rationale: string; risks?: string; status: DesignProposalStatus; }
export interface LeadDesignerDecisionRecord { id: string; system: string; decision: LeadDesignerDecision; problem: string; reasoning: string; requiredAction: string; requiredFiles: string[]; prohibitedChanges: string[]; verification: string[]; sourceProposalId?: string; }
export interface LeadDesignerCase { system: string; problem: string; repositoryEvidence: string; assistantReport?: string; auditorFeedback?: string; history?: string; }
const DECISIONS: LeadDesignerDecision[] = ["IMPLEMENT_REQUIRED","NO_CHANGE_REQUIRED","APPROVED","APPROVED_WITH_MODIFICATIONS","REJECTED","DEFERRED","BLOCKED","HUMAN_DECISION_REQUIRED"];
function makeId(prefix: "LD" | "DP"): string { return `${prefix}-${Date.now().toString(36).toUpperCase()}`; }
export function createDesignProposal(input: Omit<DesignProposal, "id" | "status">): DesignProposal { return { ...input, id: makeId("DP"), status: "PROPOSED" }; }
function section(raw: string, name: string): string { const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); return raw.match(new RegExp(`^${escaped}\\s*\\n?([\\s\\S]*?)(?=\\n[A-Z][A-Z ]+$|$)`, "im"))?.[1]?.trim() ?? ""; }
function listSection(raw: string, name: string): string[] { return section(raw, name).split("\n").map(value => value.replace(/^\s*[-*]\s*/, "").trim()).filter(Boolean); }

export async function resolveLeadDesignerCase(input: LeadDesignerCase): Promise<LeadDesignerDecisionRecord> {
  const rules = readRulesBible();
  const prompt = `BLOODLINES LEAD DESIGNER\n\nYou are the binding technical and game-design authority. Inspect supplied evidence and make a concrete decision.

SUPERPOWERS DESIGN METHODOLOGY:
${SUPERPOWERS_DESIGN_SKILLS} Do not invent mechanics, files, APIs, costs, formulas, triggers, or missing systems. Preserve correct existing implementation.\n\nRULE AUTHORITY: docs/RULES_BIBLE.md is authoritative. Approved rules are requirements. Unspecified mechanics remain unspecified.\n\nSYSTEM: ${input.system}\nPROBLEM:\n${input.problem}\n\nRULES:\n${rules}\n\nREPOSITORY EVIDENCE:\n${input.repositoryEvidence}\n\nASSISTANT REPORT:\n${input.assistantReport ?? "None supplied."}\n\nAUDITOR FEEDBACK:\n${input.auditorFeedback ?? "None supplied."}\n\nCASE HISTORY:\n${input.history ?? "None supplied."}\n\nReturn exactly:\nDECISION\nPROBLEM\nREASONING\nREQUIRED ACTION\nREQUIRED FILES\nPROHIBITED CHANGES\nVERIFICATION\n\nDECISION must be one of: ${DECISIONS.join(", ")}. Use NO_CHANGE_REQUIRED when evidence proves the approved requirements are already satisfied. Use IMPLEMENT_REQUIRED for a concrete repository change. If a proposal introduces new gameplay not already approved by the Rules Bible, use HUMAN_DECISION_REQUIRED or REJECTED.`;
  try {
    const raw = await askAI(prompt, 2200, "You are the BLOODLINES Lead Designer. Issue binding, evidence-backed decisions. Do not write code.", false);
    const candidate = section(raw, "DECISION").split(/\s+/)[0].toUpperCase() as LeadDesignerDecision;
    const decision = DECISIONS.includes(candidate) ? candidate : "HUMAN_DECISION_REQUIRED";
    return { id: makeId("LD"), system: input.system, decision, problem: section(raw,"PROBLEM") || input.problem, reasoning: section(raw,"REASONING") || raw, requiredAction: section(raw,"REQUIRED ACTION"), requiredFiles: listSection(raw,"REQUIRED FILES"), prohibitedChanges: listSection(raw,"PROHIBITED CHANGES"), verification: listSection(raw,"VERIFICATION") };
  } catch (error) {
    return { id: makeId("LD"), system: input.system, decision: "HUMAN_DECISION_REQUIRED", problem: input.problem, reasoning: `Lead Designer could not obtain a trustworthy AI decision: ${error instanceof Error ? error.message : String(error)}`, requiredAction: "Human Lead Designer review is required before another automatic implementation attempt.", requiredFiles: [], prohibitedChanges: ["Do not invent mechanics or bypass governance to force an implementation."], verification: [] };
  }
}

/** Compatibility entry point for the existing research-design runners. It returns the binding design decision as Markdown rather than silently approving research. */
export async function reviewDesign(researchPath: string): Promise<string> {
  const research = fs.readFileSync(researchPath, "utf8");
  const decision = await resolveLeadDesignerCase({
    system: "Design Review",
    problem: `Review the proposed design contained in ${researchPath}. Determine what, if anything, is authorized for BLOODLINES.`,
    repositoryEvidence: `Research proposal path: ${researchPath}\nThe proposal itself is evidence, not approval.`,
    history: research,
  });
  return `# Lead Designer Decision\n\nDecision: ${decision.decision}\n\n## Problem\n${decision.problem}\n\n## Reasoning\n${decision.reasoning}\n\n## Required Action\n${decision.requiredAction || "None."}\n\n## Required Files\n${decision.requiredFiles.length ? decision.requiredFiles.map(file => `- ${file}`).join("\n") : "None."}\n\n## Prohibited Changes\n${decision.prohibitedChanges.length ? decision.prohibitedChanges.map(item => `- ${item}`).join("\n") : "None."}\n\n## Verification\n${decision.verification.length ? decision.verification.map(item => `- ${item}`).join("\n") : "None."}`;
}
