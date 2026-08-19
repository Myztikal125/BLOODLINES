# D&D Repository Research for BLOODLINES

Research date: 2026-08-19

## Repositories reviewed

- 5e-bits/5e-database — structured D&D 5e API database. Useful as a reference/import source for open 5e data and stable identifiers.
- BTMorton/dnd-5e-srd — SRD 5e data converted to JSON/YAML/Markdown. Useful as an offline normalization/reference source.
- open5e/open5e — open 5e reference/API architecture. Useful for content discovery and API patterns; non-SRD content must remain provenance-labeled.
- sycarion/5e-2024-SRD — Markdown representation of SRD 5.2.1. Useful for current 2024/SRD research and normalization.
- azemoning/omni-5e — structured/queryable SRD 5.2.1 with versioned API. Useful for version-aware content ingestion.
- foundryvtt/dnd5e — mature rules-system architecture. Particularly useful patterns: activities, advancements, active effects, actor/item separation, derived data, and dual 2014/2024 compatibility.
- dearlordylord/5e-quint — runtime-oriented 5.2.1 implementation. Particularly useful patterns: character creation runtime, progression, character-sheet projection, battle-entry projection, battle reducer, snapshots, and focused rule tests.

## Patterns adopted into BLOODLINES

- Data-driven character creation choices
- Typed level advancement
- Unified activity/action model
- Data-driven active effects
- Explicit rules-version/provenance context
- Engine-first DM orchestration
- Deterministic modifier and derived-stat processing
- Typed domain events
- Persistent NPC memory, retrieval, prefetch, and reflection primitives
- Timeline/checkpoint primitives
- Centralized AI tool contracts

## Character creation target

BLOODLINES should support a source-aware catalog with separate provenance for:

- ancestry/species and variants
- classes and subclasses
- backgrounds
- feats
- skills, tools, and languages
- equipment
- spells
- class/feature progression
- ability-score generation and improvements

BLOODLINES custom content is authoritative. D&D 2024 is the preferred fallback, with D&D 2014 retained for compatibility. A source record must identify the rules version and license/attribution where applicable.

## What we do not do

We do not copy entire proprietary sourcebooks or non-open copyrighted databases into BLOODLINES. Open/SRD-compatible data can be imported when its license permits it, with provenance and attribution preserved. Non-SRD repositories are used for architecture and research rather than as a content dump.

## Next research pass

Before finalizing the character catalog, compare 2014 vs 2024 character creation mechanically: species/ancestry, backgrounds/origin feats, classes/subclasses, feat categories, ability-score assignment, starting equipment, spellcasting, multiclassing, and level progression. Resolve conflicts explicitly in BLOODLINES data instead of hiding them in engine code.
