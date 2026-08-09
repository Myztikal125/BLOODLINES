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

/**
 * Runs any assistant report through the central auditor until it is approved
 * or the auditor requires human action. The originating assistant owns the
 * correction callback; the auditor only explains what must be fixed.
 */
export async function runAuditedReportWorkflow(
  initialReport: AssistantReport,
  reviseReport: (feedback: string, revision: number) => Promise<AssistantReport>,
  options: AuditedReportWorkflowOptions,
): Promise<AuditedReportWorkflowResult> {
  const auditor = options.auditor ?? new ReportAuditor();
  return auditor.reviewWithCorrections(
    initialReport,
    options.rulesAuthority,
    options.repositoryEvidence,
    reviseReport,
    options.otherReports ?? auditor.getHistory().filter(report => report.assistant !== initialReport.assistant || report.system !== initialReport.system),
  );
}
