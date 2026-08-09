import fs from "fs";
import path from "path";
import { askAI } from "./aiClient";

export type ReportAuditVerdict = "APPROVED" | "REVISION_REQUIRED" | "CONFLICT" | "ESCALATE";
export interface AssistantReport { assistant: string; system: string; report: string; revision: number; repositoryEvidence?: string; }
export interface ReportAuditResult { verdict: ReportAuditVerdict; assistant: string; system: string; revision: number; problems: string[]; requiredCorrections: string[]; feedback: string; attemptsRemaining: number; humanActionRequired: boolean; }
export interface ReportAuditRecord extends AssistantReport { verdict: ReportAuditVerdict; problems: string[]; requiredCorrections: string[]; feedback: string; timestamp: string; }
export interface ReportAuditorOptions { maxAutomaticRevisions?: number; historyPath?: string; }

const DEFAULT_MAX_AUTOMATIC_REVISIONS = 3;
const DEFAULT_HISTORY_PATH = "data/ai/reportAuditHistory.json";
const REQUIRED_IMPLEMENTATION_SECTIONS = ["Implementation Status","Approved Requirements","Repository Findings","Human Decisions Required","Files Affected","Required Changes","Tests","Risks","Verification"];

function sectionPositions(report: string): number[] { return REQUIRED_IMPLEMENTATION_SECTIONS.map(section => { const markdown = report.indexOf(`# ${section}`); const plain = report.indexOf(section); return markdown >= 0 ? markdown : plain; }); }
function hasAllImplementationSections(report: string): boolean { const positions = sectionPositions(report); return positions.every(position => position >= 0) && positions.every((position, index) => index === 0 || position > positions[index - 1]); }
function extractSection(report: string, heading: string): string { const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); const start = report.search(new RegExp(`(?:^|\\n)#?\\s*${escaped}\\s*\\n`, "i")); if (start < 0) return ""; const afterHeading = report.slice(start).replace(new RegExp(`^(?:\\n)#?\\s*${escaped}\\s*\\n`, "i"), ""); const next = afterHeading.search(/\n#?\s*(?:Implementation Status|Approved Requirements|Repository Findings|Human Decisions Required|Files Affected|Required Changes|Tests|Risks|Verification)\s*\n/i); return (next >= 0 ? afterHeading.slice(0, next) : afterHeading).trim(); }
function normalize(value: string): string { return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim(); }
function repeatedReport(previous: AssistantReport | undefined, current: AssistantReport): boolean { if (!previous) return false; const a = normalize(previous.report); const b = normalize(current.report); if (!a || !b) return false; if (a === b) return true; const shorter = Math.min(a.length, b.length); const common = a.split(" ").filter((word, index, words) => words.indexOf(word) === index && b.includes(` ${word} `)).length; return shorter > 500 && common / Math.max(1, new Set(a.split(" ")).size) > 0.92; }
function loadHistory(historyPath: string): ReportAuditRecord[] { try { if (!fs.existsSync(historyPath)) return []; const parsed = JSON.parse(fs.readFileSync(historyPath, "utf8")); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
function saveHistory(historyPath: string, history: ReportAuditRecord[]): void { fs.mkdirSync(path.dirname(historyPath), { recursive: true }); fs.writeFileSync(historyPath, JSON.stringify(history.slice(-200), null, 2), "utf8"); }

export class ReportAuditor {
  private readonly maxAutomaticRevisions: number;
  private readonly historyPath: string;
  private readonly history: ReportAuditRecord[];
  constructor(options: ReportAuditorOptions = {}) { this.maxAutomaticRevisions = Math.max(1, options.maxAutomaticRevisions ?? DEFAULT_MAX_AUTOMATIC_REVISIONS); this.historyPath = path.resolve(process.cwd(), options.historyPath ?? DEFAULT_HISTORY_PATH); this.history = loadHistory(this.historyPath); }
  getHistory(): ReportAuditRecord[] { return [...this.history]; }
  getAssistantHistory(assistant: string, system: string): ReportAuditRecord[] { return this.history.filter(record => record.assistant === assistant && record.system === system); }
  private append(record: ReportAuditRecord): void { this.history.push(record); saveHistory(this.historyPath, this.history); }

  async review(report: AssistantReport, rulesAuthority: string, repositoryEvidence: string, otherReports: AssistantReport[] = []): Promise<ReportAuditResult> {
    const prior = this.getAssistantHistory(report.assistant, report.system).at(-1);
    const revision = report.revision || (prior?.revision ?? 0) + 1;
    const current = { ...report, revision, repositoryEvidence };
    const priorRejected = prior && prior.verdict !== "APPROVED";
    const noProgress = repeatedReport(priorRejected ? prior : undefined, current);
    const structuralProblems: string[] = [];
    const requiredCorrections: string[] = [];
    if (!hasAllImplementationSections(report.report)) { structuralProblems.push("The implementation report does not contain all nine required sections in the required order."); requiredCorrections.push(`Return all nine sections in this exact order: ${REQUIRED_IMPLEMENTATION_SECTIONS.join(", ")}.`); }
    if (!extractSection(report.report, "Implementation Status")) structuralProblems.push("Implementation Status is empty.");
    if (!extractSection(report.report, "Approved Requirements")) structuralProblems.push("Approved Requirements is empty.");
    if (!extractSection(report.report, "Repository Findings")) structuralProblems.push("Repository Findings is empty.");
    if (!extractSection(report.report, "Verification")) structuralProblems.push("Verification is empty.");
    const previousReports = otherReports.map(item => `ASSISTANT: ${item.assistant}\nSYSTEM: ${item.system}\nREVISION: ${item.revision}\nREPORT:\n${item.report}`).join("\n\n");
    const auditPrompt = `You are the BLOODLINES Report Auditor. You are the independent gatekeeper for reports from every assistant. You do not modify code. Decide whether the originating assistant must revise its work before final implementation is allowed.\n\nRULE AUTHORITY HIERARCHY\n1. Approved Rules Bible and approved design decisions are authoritative.\n2. Compiled approved rules support them.\n3. Research/proposals are not requirements unless explicitly approved.\n4. Existing code and tests are evidence, not authority over approved rules.\n\nAUDIT REQUIREMENTS\n- Review the complete supplied rules authority, not only the named system.\n- Check the report against repository evidence.\n- Check relevant reports from other assistants for contradictions.\n- Detect omitted requirements, contradictions, invented mechanics, unsupported completion claims, and unverified implementation claims.\n- Do not reject a report merely because it lacks a particular phrase when repository evidence proves the requirement is satisfied.\n- If the rules conflict or are genuinely ambiguous, return ESCALATE rather than inventing a resolution.\n- If correct and supported, return APPROVED.\n- If reasonably correctable, return REVISION_REQUIRED with exact corrections.\n- If it contradicts an approved rule or another approved report, return CONFLICT.\n- Return ESCALATE when automatic correction should stop.\n\nOUTPUT EXACTLY:\nVERDICT: APPROVED | REVISION_REQUIRED | CONFLICT | ESCALATE\nPROBLEMS:\n- ...\nREQUIRED_CORRECTIONS:\n- ...\nFEEDBACK:\n...\n\nASSISTANT: ${report.assistant}\nSYSTEM: ${report.system}\nREVISION: ${revision}\nCURRENT REPORT:\n${report.report}\n\nCOMPLETE RULE AUTHORITY:\n${rulesAuthority}\n\nREPOSITORY EVIDENCE:\n${repositoryEvidence}\n\nOTHER ASSISTANT REPORTS:\n${previousReports || "None supplied."}\n\nSTRUCTURAL CHECKS FROM HOST:\n${structuralProblems.join("\n") || "None."}`;
    let verdict: ReportAuditVerdict; let problems = [...structuralProblems]; let corrections = [...requiredCorrections]; let feedback = "";
    try { const raw = await askAI(auditPrompt, 1600, "You are the central BLOODLINES Report Auditor. Be strict about approved rules and repository evidence. Do not write code.", false); const parsed = parseAuditResponse(raw); verdict = parsed.verdict; problems.push(...parsed.problems); corrections.push(...parsed.requiredCorrections); feedback = parsed.feedback; }
    catch (error) { verdict = "ESCALATE"; problems.push(`Report Auditor could not complete its independent review: ${error instanceof Error ? error.message : String(error)}`); corrections.push("Human review is required because the central auditor could not establish a trustworthy verdict."); feedback = "Automatic report review failed; the workflow is paused for human action."; }
    if (noProgress && verdict === "REVISION_REQUIRED") { verdict = "ESCALATE"; problems.push("The assistant repeated substantially the same rejected report without meaningful progress."); corrections.push("Human action is required before another automatic revision is attempted."); feedback = `${feedback}\n\nThe report did not make meaningful progress from the previous rejected revision.`.trim(); }
    const attemptsRemaining = Math.max(0, this.maxAutomaticRevisions - revision);
    if (verdict === "REVISION_REQUIRED" && attemptsRemaining === 0) { verdict = "ESCALATE"; problems.push(`Maximum automatic revision count (${this.maxAutomaticRevisions}) was reached.`); corrections.push("Human action is required to resolve the persistent implementation/report failure."); feedback = `${feedback}\n\nMaximum automatic revisions reached.`.trim(); }
    const result: ReportAuditResult = { verdict, assistant: report.assistant, system: report.system, revision, problems: unique(problems), requiredCorrections: unique(corrections), feedback: feedback || unique(corrections).join("\n"), attemptsRemaining, humanActionRequired: verdict === "ESCALATE" || attemptsRemaining === 0 && verdict !== "APPROVED" };
    this.append({ ...current, verdict, problems: result.problems, requiredCorrections: result.requiredCorrections, feedback: result.feedback, timestamp: new Date().toISOString() }); return result;
  }

  async reviewWithCorrections(initial: AssistantReport, rulesAuthority: string, repositoryEvidence: string, revise: (feedback: string, revision: number) => Promise<AssistantReport>, otherReports: AssistantReport[] = []): Promise<{ finalReport: AssistantReport; audit: ReportAuditResult }> { let current = initial; for (;;) { const audit = await this.review(current, rulesAuthority, repositoryEvidence, otherReports); if (audit.verdict === "APPROVED" || audit.verdict === "CONFLICT" || audit.verdict === "ESCALATE") return { finalReport: current, audit }; current = await revise(audit.feedback, audit.revision + 1); } }
}

function parseAuditResponse(raw: string): { verdict: ReportAuditVerdict; problems: string[]; requiredCorrections: string[]; feedback: string } { const verdictMatch = raw.match(/VERDICT:\s*(APPROVED|REVISION_REQUIRED|CONFLICT|ESCALATE)/i); if (!verdictMatch) throw new Error("Report Auditor returned no valid verdict."); const verdict = verdictMatch[1].toUpperCase() as ReportAuditVerdict; return { verdict, problems: extractList(raw, "PROBLEMS"), requiredCorrections: extractList(raw, "REQUIRED_CORRECTIONS"), feedback: raw.match(/FEEDBACK:\s*([\s\S]*)/i)?.[1]?.trim() ?? "" }; }
function extractList(raw: string, heading: string): string[] { const match = raw.match(new RegExp(`${heading}:\\s*([\\s\\S]*?)(?=\\n[A-Z_ ]+:|$)`, "i")); if (!match) return []; return match[1].split("\n").map(line => line.replace(/^\s*[-*]\s*/, "").trim()).filter(Boolean); }
function unique(values: string[]): string[] { return [...new Set(values.map(value => value.trim()).filter(Boolean))]; }
