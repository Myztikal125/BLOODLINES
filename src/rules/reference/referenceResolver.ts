import type { DndEdition, RuleRecord, RuleReference } from "./types";
import { ReferenceRegistry } from "./referenceRegistry";

export interface ResolutionResult<T = unknown> {
  record?: RuleRecord<T>;
  chain: RuleReference[];
}

/** BLOODLINES is authoritative; D&D 2024 and then 2014 are reference fallbacks. */
export class ReferenceResolver {
  constructor(private readonly registry: ReferenceRegistry) {}

  resolve<T = unknown>(key: string, preferredEdition: DndEdition = "2024"): ResolutionResult<T> {
    const editions: DndEdition[] = preferredEdition === "2024" ? ["2024", "2014"] : ["2014", "2024"];
    const chain: RuleReference[] = [
      { system: "bloodlines", key, authority: "authoritative", sourceId: "bloodlines" },
      ...editions.map(edition => ({
        system: "dnd" as const,
        edition,
        key,
        authority: "reference" as const,
        sourceId: edition === "2024" ? "dnd-2024-srd-5.2.1" : "dnd-2014-srd",
      })),
    ];

    for (const reference of chain) {
      const record = this.registry.get<T>(reference);
      if (record) return { record, chain };
    }
    return { chain };
  }
}
