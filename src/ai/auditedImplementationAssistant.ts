import { askAI } from "./aiClient";
import { implementDesign, readRulesBible, validateImplementationPlan, type ImplementationResult } from "./implementationAssistant";
import { ReportAuditor, type AssistantReport } from "./reportAuditor";

export interface AuditedImplementationRequest {
  system: string;
  context?: string;
  dataFile?: string;
  enginePath?: string;
  maxAutomaticRevisions?: number;
}

export interface AuditedImplementationResult extends ImplementationResult {
  auditVerdict: "APPROVED" | "REVISION_REQUIRED" | "CONFLICT" | "ESCALATE";
  auditRevision: number;
  humanActionRequired: boolean;
}

const sections = [
  "Implementation Status",
  "Approved Requirements",
  "Repository Findings",
  "Human Decisions Required",
  "Files Affected",
  "Required Changes",
  "Tests",
  "Risks",
  "Verification",
];

function extractSection(report: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&");
  const match = report.match(new RegExp(`(?:^|\\n)#?\\s*${escaped}\\s*\\n([\\s\\S]*?)(?=\\n#?\\s*(?:${sections.map(s => s.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")).join("|")})\\s*\\n|$)`, "i"));
  return match?.[1]?.trim() ?? "";
}

function buildRevisionPrompt(request: AuditedImplementationRequest, rules: string, report: string, feedback: string): string {
  return `BLOODLINES IMPLEMENTATION REPORT REVISION\n\nRevise the implementation report using the auditor feedback below. You are correcting your own work, not merely changing wording. Reinspect the repository evidence and preserve all previously satisfied requirements. Do not invent mechanics.\n\nSYSTEM: ${request.system}\nCONTEXT: ${request.context ?? ""}\nRULES AUTHORITY:\n${rules}\n\nCURRENT REPORT:\n${report}\n\nAUDITOR FEEDBACK:\n${feedback}\n\nReturn exactly these nine sections in this order:\n${sections.join("\n")}\n\nIf and only if an actual repository change is required, append <IMPLEMENTATION_PATCHES> containing a valid JSON array. Do not emit fake tool calls, unified diffs, Markdown fences, YAML, or prose outside the report and optional patch payload.`;
}

export async function runAuditedImplementation(request: AuditedImplementationRequest): Promise<AuditedImplementationResult> {
  const auditor = new ReportAuditor({ maxAutomaticRevisions: request.maxAutomaticRevisions ?? 3 });
  const rulesBible = readRulesBible();
  const rules = rulesBible;
  const dataFile = request.dataFile ?? "data/rules/compiledRules.json";
  const enginePath = request.enginePath ?? "engine";
  let currentReport = "";
  let revision = 1;

  for (;;) {
    const prompt = revision === 1
      ? `BLOODLINES IMPLEMENTATION REPORT\n\nInspect the repository and produce the implementation report for ${request.system}. Do not patch code during this audit stage.\n\nCONTEXT:\n${request.context ?? "Determine implementation status and authorized changes."}\n\nRULES AUTHORITY:\n${rules}\n\nReturn exactly these nine sections in this order:\n${sections.join("\n")}\n\nKeep each section concise. Do not invent mechanics. Do not emit tool-call markup.`
      : buildRevisionPrompt(request, rules, currentReport, lastFeedback);

    const raw = await askAI(prompt, 3000, "You are the BLOODLINES Implementation Assistant preparing a report for independent audit. Do not modify code during the report stage.");
    currentReport = validateImplementationPlan(request.system, raw);

    const audit = await auditor.review(
      { assistant: "Implementation Assistant", system: request.system, report: currentReport, revision },
      rules,
      `Implementation report audit is being performed before implementation. Repository path: ${enginePath}. Data rules: ${dataFile}.`,
      auditor.getHistory().filter(record => record.assistant !== "Implementation Assistant" || record.system !== request.system),
    );

    if (audit.verdict === "APPROVED") {
      const implementation = await implementDesign(dataFile, enginePath, {
        system: request.system,
        context: `${request.context ?? ""}\n\nAUDITOR-APPROVED REPORT:\n${currentReport}\n\nThe report above passed the central Report Auditor. Implement only the approved changes.`.slice(0, 12000),
      });
      return { ...implementation, auditVerdict: audit.verdict, auditRevision: revision, humanActionRequired: false };
    }

    if (audit.verdict === "REVISION_REQUIRED") {
      if (audit.humanActionRequired) {
        return { report: `${currentReport}\n\nREPORT AUDITOR\nESCALATED — ${audit.feedback}`, patches: [], applied: false, auditVerdict: audit.verdict, auditRevision: revision, humanActionRequired: true };
      }
      lastFeedback = audit.feedback;
      revision += 1;
      continue;
    }

    return { report: `${currentReport}\n\nREPORT AUDITOR\n${audit.verdict} — ${audit.feedback}`, patches: [], applied: false, auditVerdict: audit.verdict, auditRevision: revision, humanActionRequired: audit.humanActionRequired };
  }
}

let lastFeedback = "";
