import type { DndEdition, RuleRecord } from "../rules/reference/types";
import { ReferenceResolver } from "../rules/reference/referenceResolver";

export interface RuleLookupResult<T = unknown> {
  key: string;
  edition: DndEdition;
  found: boolean;
  record?: RuleRecord<T>;
}

/** Read-only reference lookup for the DM. It cannot mutate game state. */
export class RuleLookup {
  constructor(private readonly resolver: ReferenceResolver) {}

  lookup<T = unknown>(key: string, edition: DndEdition = "2024"): RuleLookupResult<T> {
    const result = this.resolver.resolve<T>(key, edition);
    return { key, edition, found: Boolean(result.record), record: result.record };
  }
}
