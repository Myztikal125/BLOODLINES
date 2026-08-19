export type AuditKind = "tool_call" | "state_mutation" | "dm_decision" | "system" | "error";

export interface AuditRecord {
  id: string;
  kind: AuditKind;
  timestamp: number;
  actor: "player" | "dm" | "engine" | "system";
  action: string;
  input?: unknown;
  result?: unknown;
  stateVersion?: number;
}

export class AuditLog {
  private readonly records: AuditRecord[] = [];

  append(record: AuditRecord): void {
    this.records.push(Object.freeze({ ...record }));
  }

  list(): readonly AuditRecord[] {
    return this.records;
  }

  byAction(action: string): AuditRecord[] {
    return this.records.filter(record => record.action === action);
  }
}
