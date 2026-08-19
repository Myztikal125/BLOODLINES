import type { RuleRecord, RuleReference } from "./types";

export class ReferenceRegistry {
  private readonly records = new Map<string, RuleRecord>();

  register<T>(record: RuleRecord<T>): void {
    this.records.set(this.idFor(record), record as RuleRecord);
  }

  get<T = unknown>(reference: RuleReference): RuleRecord<T> | undefined {
    const record = this.records.get(this.idFor(reference));
    return record as RuleRecord<T> | undefined;
  }

  list(): readonly RuleRecord[] {
    return [...this.records.values()];
  }

  private idFor(reference: RuleReference): string {
    return [reference.system, reference.edition ?? "", reference.version ?? "", reference.key].join(":");
  }
}
