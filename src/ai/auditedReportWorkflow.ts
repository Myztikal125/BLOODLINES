import { ReportAuditor, type AssistantReport, type ReportAuditResult } from "./reportAuditor";

export interface AuditedReportWorkflowOptions {
  auditor?: ReportAuditor;
  rulesAuthority: string;
  repositoryEvidence: string;
  otherReports?: AssistantReport[];
}

export interface AuditedReportWorkflowResult {
  report: AssistantReport;
  audit: ReportAuditResult;
}

/** Runs an assistant report through the central auditor until approved or human action is required. */
export async function runAuditedReportWorkflow(
  initialReport: AssistantReport,
  reviseReport: (feedback: string, revision: number) => Promise<AssistantReport>,
  options: AuditedReportWorkflowOptions,
): Promise<AuditedReportWorkflowResult> {
  const auditor = options.auditor ?? new ReportAuditor();
  const result = await auditor.reviewWithCorrections(
    initialReport,
    options.rulesAuthority,
    options.repositoryEvidence,
    reviseReport,
    options.otherReports ?? auditor.getHistory().filter(report => report.assistant !== initialReport.assistant || report.system !== initialReport.system),
  );
  return { report: result.finalReport, audit: result.audit };
}
