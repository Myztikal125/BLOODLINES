export type RulesSystem = "dnd" | "bloodlines";
export type DndEdition = "2014" | "2024";
export type ReferenceAuthority = "authoritative" | "reference";

export interface RuleReference {
  system: RulesSystem;
  edition?: DndEdition;
  version?: string;
  key: string;
  authority: ReferenceAuthority;
  sourceId: string;
  overrides?: string;
}

export interface RuleRecord<T = unknown> extends RuleReference {
  data: T;
}

export interface ReferenceSource {
  id: string;
  name: string;
  system: RulesSystem;
  edition?: DndEdition;
  version?: string;
  uri?: string;
  redistributable: boolean;
  notes?: string;
}
