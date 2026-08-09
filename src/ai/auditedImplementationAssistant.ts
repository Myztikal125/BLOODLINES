import { askAI } from "./aiClient";
import { implementDesign, readRulesBible, type ImplementationResult } from "./implementationAssistant";
import { ReportAuditor } from "./reportAuditor";

export interface AuditedImplementationRequest { system: string; context?: string; dataFile?: string; enginePath?: string; maxAutomaticRevisions?: number; }
export interface AuditedImplementationResult extends ImplementationResult { auditVerdict: "APPROVED" | "REVISION_REQUIRED" | "CONFLICT" | "ESCALATE"; auditRevision: number; humanActionRequired: boolean; }

const sections = ["Implementation Status","Approved Requirements","Repository Findings","Human Decisions Required","Files Affected","Required Changes","Tests","Risks","Verification"];

function validateReportShape(report: string): string {
  const positions = sections.map(section => report.search(new RegExp(`(?:^|\\n)#?\\s*${section.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\s*$`, "im")));
  if (positions.some(p => p < 0) || positions.some((p, i) => i > 0 && p <= positions[i - 1])) throw new Error("Implementation report rejected: required report sections are missing or out of order.");
  if (/stamina\\s+cost\\s+of\\s+\\d+|staminacost\\s*[:=]\\s*\\d+/i.test(report)) throw new Error("Implementation report rejected: unspecified mechanics were invented.");
  return report;
}

function failureResult(error: unknown, revision: number): AuditedImplementationResult {
  const message = error instanceof Error ? error.message : String(error);
  return { report: `REPORT GENERATION FAILED\n\n${message}\n\nREPORT AUDITOR\nESCALATE — the Implementation Assistant could not produce a trustworthy report because no AI provider was available.`, patches: [], applied: false, auditVerdict: "ESCALATE", auditRevision: revision, humanActionRequired: true };
}

function buildRevisionPrompt(request: AuditedImplementationRequest, rules: string, report: string, feedback: string): string {
  return `BLOODLINES IMPLEMENTATION REPORT REVISION\n\nRevise the implementation report using the auditor feedback below. Correct the underlying work, not merely wording. Reinspect repository evidence, preserve satisfied requirements, and do not invent mechanics.\n\nSYSTEM: ${request.system}\nCONTEXT: ${request.context ?? ""}\nRULES AUTHORITY:\n${rules}\nCURRENT REPORT:\n${report}\nAUDITOR FEEDBACK:\n${feedback}\n\nReturn exactly these nine sections in this order:\n${sections.join("\n")}\n\nIf and only if an actual repository change is required, append <IMPLEMENTATION_PATCHES> containing a valid JSON array. Do not emit fake tool calls, unified diffs, Markdown fences, YAML, or prose outside the report and optional patch payload.`;
}

export async function runAuditedImplementation(request: AuditedImplementationRequest): Promise<AuditedImplementationResult> {
  const auditor = new ReportAuditor({ maxAutomaticRevisions: request.maxAutomaticRevisions ?? 3 });
  const rules = readRulesBible();
  const dataFile = request.dataFile ?? "data/rules/compiledRules.json";
  const enginePath = request.enginePath ?? "engine";
  let currentReport = "";
  let revision = 1;
  let feedback = "";

  for (;;) {
    const prompt = revision === 1
      ? `BLOODLINES IMPLEMENTATION REPORT\n\nInspect the repository and produce the implementation report for ${request.system}. Do not patch code during this audit stage.\n\nCONTEXT:\n${request.context ?? "Determine implementation status and authorized changes."}\nRULES AUTHORITY:\n${rules}\n\nReturn exactly these nine sections in this order:\n${sections.join("\n")}\n\nKeep each section concise. Do not invent mechanics. Do not emit tool-call markup.`
      : buildRevisionPrompt(request, rules, currentReport, feedback);

    try {
      const raw = await askAI(prompt, 1800, "You are the BLOODLINES Implementation Assistant preparing a report for independent audit. Do not modify code during the report stage.", false);
      currentReport = validateReportShape(raw);
    } catch (error) {
      return failureResult(error, revision);
    }

    const audit = await auditor.review(
      { assistant: "Implementation Assistant", system: request.system, report: currentReport, revision },
      rules,
      `Implementation report audit is being performed before implementation. Repository path: ${enginePath}. Data rules: ${dataFile}.`,
      auditor.getHistory().filter(record => record.assistant !== "Implementation Assistant" || record.system !== request.system),
    );

    if (audit.verdict === "APPROVED") {
      const implementation = await implementDesign(dataFile, enginePath, { system: request.system, context: `${request.context ?? ""}\n\nAUDITOR-APPROVED REPORT:\n${currentReport}\n\nImplement only the approved changes.`.slice(0, 12000) });
      return { ...implementation, auditVerdict: audit.verdict, auditRevision: revision, humanActionRequired: false };
    }
    if (audit.verdict === "REVISION_REQUIRED" && !audit.humanActionRequired) { feedback = audit.feedback; revision += 1; continue; }
    return { report: `${currentReport}\n\nREPORT AUDITOR\n${audit.verdict} — ${audit.feedback}`, patches: [], applied: false, auditVerdict: audit.verdict, auditRevision: revision, humanActionRequired: audit.humanActionRequired || audit.verdict !== "APPROVED" };
  }
}
