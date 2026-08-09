import { askAI } from "./aiClient";
import { implementDesign, readRulesBible, validateImplementationPlan, type ImplementationResult } from "./implementationAssistant";
import { ReportAuditor } from "./reportAuditor";

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

function validateReportShape(report: string): string {
  const positions = sections.map(section => {
    const plain = report.search(new RegExp(`(?:^|\\n)#?\\s*${section.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\s*$`, "im"));
    return plain;
  });
  if (positions.some(p => p < 0) || positions.some((p, i) => i > 0 && p <= positions[i - 1])) {
    throw new Error("Implementation report rejected: required report sections are missing or out of order.");
  }
  if (/stamina\\s+cost\\s+of\\s+\\d+|staminacost\\s*[:=]\\s*\\d+/i.test(report)) {
    throw new Error("Implementation report rejected: unspecified mechanics were invented.");
  }
  return report;
}

function buildRevisionPrompt(request: AuditedImplementationRequest, rules: string, report: string, feedback: string, repositoryEvidence: string): string {
  return `BLOODLINES IMPLEMENTATION REPORT REVISION\n\nRevise your previous report using the auditor/governance feedback below. Correct the actual implementation assessment, not merely the wording. You must stay grounded in the supplied repository evidence. Do not invent files, classes, directories, APIs, mechanics, or missing systems. Every Repository Finding and Files Affected entry must be supported by the supplied evidence. If evidence shows a system already exists, do not claim it is missing. Preserve requirements that are already satisfied.\n\nSYSTEM: ${request.system}\nCONTEXT:\n${request.context ?? ""}\n\nRULES AUTHORITY:\n${rules}\n\nREPOSITORY EVIDENCE:\n${repositoryEvidence}\n\nCURRENT REPORT:\n${report}\n\nFEEDBACK:\n${feedback}\n\nReturn exactly these nine sections in this order:\n${sections.join("\n")}\n\nIf and only if an actual repository change is required, append <IMPLEMENTATION_PATCHES> containing a valid JSON array. Do not emit fake tool calls, unified diffs, Markdown fences, YAML, or prose outside the report and optional patch payload.`;
}

export async function runAuditedImplementation(request: AuditedImplementationRequest): Promise<AuditedImplementationResult> {
  const auditor = new ReportAuditor({ maxAutomaticRevisions: request.maxAutomaticRevisions ?? 3 });
  const rules = readRulesBible();
  const dataFile = request.dataFile ?? "data/rules/compiledRules.json";
  const enginePath = request.enginePath ?? "engine";
  const repositoryEvidence = `Known repository scope: ${enginePath}\nRules data: ${dataFile}\nThe assistant must use the host-supplied repository evidence and must not invent repository paths or architecture.`;
  let currentReport = "";
  let revision = 1;
  let feedback = "";

  for (;;) {
    const prompt = revision === 1
      ? `BLOODLINES IMPLEMENTATION REPORT\n\nInspect the repository and produce the implementation report for ${request.system}. Do not patch code during this audit stage. Do not invent repository paths, classes, systems, APIs, or mechanics.\n\nCONTEXT:\n${request.context ?? "Determine implementation status and authorized changes."}\n\nRULES AUTHORITY:\n${rules}\n\nHOST REPOSITORY EVIDENCE:\n${repositoryEvidence}\n\nReturn exactly these nine sections in this order:\n${sections.join("\n")}\n\nKeep each section concise. Do not invent mechanics. Do not emit tool-call markup.`
      : buildRevisionPrompt(request, rules, currentReport, feedback, repositoryEvidence);

    let raw: string;
    try {
      raw = await askAI(prompt, 1800, "You are the BLOODLINES Implementation Assistant preparing a report for independent audit. Do not modify code during the report stage. Stay grounded in supplied repository evidence. Correct the actual implementation/report issue described by the feedback.", false);
    } catch (error) {
      return { report: `REPORT GENERATION FAILED\n\n${error instanceof Error ? error.message : String(error)}`, patches: [], applied: false, auditVerdict: "ESCALATE", auditRevision: revision, humanActionRequired: true };
    }

    try { currentReport = validateReportShape(raw); }
    catch (error) {
      if (revision >= (request.maxAutomaticRevisions ?? 3)) return { report: `${raw}\n\nREPORT AUDITOR\nESCALATE — ${error instanceof Error ? error.message : String(error)}`, patches: [], applied: false, auditVerdict: "ESCALATE", auditRevision: revision, humanActionRequired: true };
      feedback = error instanceof Error ? error.message : String(error); revision += 1; continue;
    }

    const audit = await auditor.review({ assistant: "Implementation Assistant", system: request.system, report: currentReport, revision }, rules, repositoryEvidence, auditor.getHistory().filter(record => record.assistant !== "Implementation Assistant" || record.system !== request.system));

    if (audit.verdict === "APPROVED") {
      try { validateImplementationPlan(request.system, currentReport); }
      catch (error) {
        if (revision >= (request.maxAutomaticRevisions ?? 3)) return { report: `${currentReport}\n\nIMPLEMENTATION GOVERNANCE\nESCALATE — ${error instanceof Error ? error.message : String(error)}`, patches: [], applied: false, auditVerdict: "ESCALATE", auditRevision: revision, humanActionRequired: true };
        feedback = `The central Report Auditor approved this report, but deterministic implementation governance rejected it. Correct the actual report while remaining grounded in the supplied repository evidence. Do not invent repository structure.\n\n${error instanceof Error ? error.message : String(error)}`; revision += 1; continue;
      }
      const implementation = await implementDesign(dataFile, enginePath, { system: request.system, context: `${request.context ?? ""}\n\nAUDITOR-APPROVED REPORT:\n${currentReport}\n\nThe report above passed the central Report Auditor and deterministic implementation governance. Implement only the approved changes.`.slice(0, 12000) });
      return { ...implementation, auditVerdict: audit.verdict, auditRevision: revision, humanActionRequired: false };
    }

    if (audit.verdict === "REVISION_REQUIRED" && !audit.humanActionRequired) { feedback = audit.feedback; revision += 1; continue; }

    return {
      report: `${currentReport}\n\nREPORT AUDITOR\n${audit.verdict} — ${audit.feedback}`,
      patches: [], applied: false,
      auditVerdict: audit.verdict,
      auditRevision: revision,
      humanActionRequired: audit.humanActionRequired,
    };
  }
}
