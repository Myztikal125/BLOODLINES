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

  if (authority === "APPROVED") {
    const implementationLanguage = /implement|implementation|missing|unimplemented|required|not fully|not currently|no evidence/i.test(`${status}\n${requiredChanges}`);
    const genuineDesignGap = /define|decide|specify|exact (?:modifier|timing|trigger|cost|resource|formula|maneuver)|unspecified mechanics|missing numerical|missing procedural/i.test(humanSection);
    if (implementationLanguage && !genuineDesignGap) {
      return { gate: "IMPLEMENT", reason: "Hard-coded governance: the system is explicitly approved; implementation cannot be escalated as a design question." };
    }
    if (implementationLanguage && /no human decisions required|none required|none\.?$/i.test(humanSection.trim())) {
      return { gate: "IMPLEMENT", reason: "Hard-coded governance: approved system with no substantive human decision requirement." };
    }
    if (implementationLanguage && !/human decision|required decision|approval/i.test(humanSection)) {
      return { gate: "IMPLEMENT", reason: "Hard-coded governance: approved implementation task does not establish a new design decision." };
    }
  }

  if (authority === "APPROVED" && /explicitly approved|approved system/i.test(`${status}\n${rulesBible}`) && !/define|decide|specify|exact (?:modifier|timing|trigger|cost|resource|formula|maneuver)|unspecified mechanics/i.test(humanSection)) {
    return { gate: "IMPLEMENT", reason: "Hard-coded governance: approved rule remains binding; implementation work is not reopened for approval." };
  }

  return { gate: "ESCALATE", reason: "A genuine unresolved design detail is present or the system is not recorded as human-approved." };
}

export function validateSuperpowersExecution(report: string, patchesApplied: boolean, verificationPassed: boolean): void {
  if (!patchesApplied && !/already|fully|completely|no (?:repository )?changes? required|none required/i.test(extractSection(report, "Implementation Status") + "\n" + extractSection(report, "Required Changes"))) {
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
