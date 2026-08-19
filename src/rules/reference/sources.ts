import type { ReferenceSource } from "./types";

export const REFERENCE_SOURCES: readonly ReferenceSource[] = Object.freeze([
  {
    id: "dnd-2024-srd-5.2.1",
    name: "D&D 2024 SRD 5.2.1",
    system: "dnd",
    edition: "2024",
    version: "5.2.1",
    redistributable: true,
    notes: "Use only the legally redistributable SRD-compatible material represented by the local dataset.",
  },
  {
    id: "dnd-2014-srd",
    name: "D&D 2014 SRD",
    system: "dnd",
    edition: "2014",
    redistributable: true,
    notes: "Use only legally redistributable SRD-compatible material represented by the local dataset.",
  },
  {
    id: "dnd-2024-book-reference",
    name: "D&D 2024 books",
    system: "dnd",
    edition: "2024",
    redistributable: false,
    notes: "External reference only. Store identifiers/citations, not copied book text.",
  },
  {
    id: "dnd-2014-book-reference",
    name: "D&D 2014 books",
    system: "dnd",
    edition: "2014",
    redistributable: false,
    notes: "External reference only. Store identifiers/citations, not copied book text.",
  },
]);

export function getReferenceSource(id: string): ReferenceSource | undefined {
  return REFERENCE_SOURCES.find(source => source.id === id);
}
