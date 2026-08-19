import fs from "fs";

export type DesignAuthority = "APPROVED" | "UNRESOLVED";
export type ExecutionGate = "IMPLEMENT" | "ESCALATE";

const APPROVED_DECISIONS_PATH = "docs/APPROVED_DECISIONS.md";

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function systemAliases(system: string): string[] {
  const normalized = normalize(system);
  const aliases = new Set([normalized]);
  if (normalized.includes("advantage") && normalized.includes("disadvantage")) aliases.add("advantage and disadvantage");
  if (normalized.includes("action economy")) aliases.add("action economy");
  return [...aliases];
}

export function getDesignAuthority(system: string, approvedDecisions = readApprovedDecisions()): DesignAuthority {
  const lines = approvedDecisions.split("\n");
  const aliases = systemAliases(system);
  for (let i = 0; i < lines.length; i++) {
    const heading = normalize(lines[i].replace(/^#+\s*/, ""));
    if (!aliases.some(alias => heading === alias || heading.includes(alias) || alias.includes(heading))) continue;
    const section = lines.slice(i, Math.min(lines.length, i + 8)).join("\n");
    if (/^-\s*approved\.?\s*$/im.test(section) || /approved\.?\s*$/im.test(section)) return "APPROVED";
  }
  return "UNRESOLVED";
}

export function readApprovedDecisions(): string {
  if (!fs.existsSync(APPROVED_DECISIONS_PATH)) return "";
  return fs.readFileSync(APPROVED_DECISIONS_PATH, "utf8");
}

export function evaluateImplementationGate(system: string, report: string, rulesBible: string): { gate: ExecutionGate; reason: string } {
  const authority = getDesignAuthority(system);
  const humanSection = extractSection(report, "Human Decisions Required");
  const requiredChanges = extractSection(report, "Required Changes");
  const status = extractSection(report, "Implementation Status");
  const humanText = humanSection.trim();
  const designGap = /\b(?:define|decide|specify)\b.*\b(?:exact|modifier|timing|trigger|cost|resource|formula|maneuver)\b|\bunspecified mechanics\b|\bmissing (?:numerical|procedural)\b/i.test(humanText);
  const explicitlyNoHumanDecision = /^(?:none required|none|no human decisions required)\.?$/i.test(humanText);
  const implementationLanguage = /\b(?:implement|implementation|missing|unimplemented|required|not fully|not currently|no evidence)\b/i.test(`${status}\n${requiredChanges}`);

  if (authority === "APPROVED") {
    if (designGap) {
      return { gate: "ESCALATE", reason: "Hard-coded governance: an unresolved design detail must be decided by the human before implementation." };
    }
    if (implementationLanguage && (explicitlyNoHumanDecision || !/\b(?:human decision|required decision|approval)\b/i.test(humanText))) {
      return { gate: "IMPLEMENT", reason: "Hard-coded governance: the system is explicitly approved and no substantive design decision remains." };
    }
  }

  if (authority === "APPROVED" && /explicitly approved|approved system/i.test(`${status}\n${rulesBible}`) && !designGap) {
    return { gate: "IMPLEMENT", reason: "Hard-coded governance: approved rule remains binding; implementation work is not reopened for approval." };
  }

  return { gate: "ESCALATE", reason: "A genuine unresolved design detail is present or the system is not recorded as human-approved." };
}

export function validateSuperpowersExecution(report: string, patchesApplied: boolean, verificationPassed: boolean): void {
  const status = extractSection(report, "Implementation Status");
  const requiredChanges = extractSection(report, "Required Changes");
  const completionEvidence = `${status}\n${requiredChanges}`;
  const statusExplicitlyComplete = /\b(?:already|fully|completely)\s+(?:implemented|satisfied|complete)\b|\bimplementation\s+(?:is\s+)?(?:complete|complete\.)\b|\bno (?:repository )?changes? required\b/i.test(status);
  const changesExplicitlyEmpty = /^(?:none required|none)\.?$/i.test(requiredChanges.trim());
  const implementationComplete = statusExplicitlyComplete && changesExplicitlyEmpty;

  if (!patchesApplied && !implementationComplete) {
    throw new Error("Superpowers execution gate: incomplete implementation cannot finish without a repository patch.");
  }
  if (patchesApplied && !verificationPassed) {
    throw new Error("Superpowers execution gate: implementation cannot be declared complete until verification passes.");
  }
}

function extractSection(report: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const start = report.search(new RegExp(`(?:^|\\n)#?\\s*${escaped}\\s*$`, "im"));
  if (start < 0) return "";
  const tail = report.slice(start).replace(new RegExp(`^(?:\\n)?#?\\s*${escaped}\\s*\\n`, "i"), "");
  const next = tail.search(/\n#?\s*(?:Implementation Status|Approved Requirements|Repository Findings|Human Decisions Required|Files Affected|Required Changes|Tests|Risks|Verification)\s*\n/i);
  return (next >= 0 ? tail.slice(0, next) : tail).trim();
}
