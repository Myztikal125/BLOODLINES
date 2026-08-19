# BLOODLINES Research Roadmap

## Research freeze status

**Status: BROAD RESEARCH COMPLETE; FINAL DETAIL PASS COMPLETE.**

The research phase covered rules, character creation, combat, spells, effects, equipment, AI-DM architecture, NPC simulation, narrative/dialogue, quests, persistence, procedural generation, accessibility, multiplayer authority, content packs, and performance. The remaining work is now design/verification against the chosen BLOODLINES specification, not open-ended architecture discovery.

## Final detail-pass findings

### Character creation and progression
- Use a versioned, data-driven option catalog rather than hardcoding choices into the UI.
- Maintain separate provenance for BLOODLINES, D&D 2024 reference, and D&D 2014 compatibility.
- Validate prerequisites, grants, conflicts, ability-score changes, proficiencies, equipment, spells, and subclass choices in a deterministic layer.
- Keep 2014 and 2024 as selectable/reference rules profiles; BLOODLINES overrides are explicit.

### Combat, actions, conditions, and effects
- Represent actions/bonus actions/reactions/movement/resources as explicit capabilities.
- Conditions and effects require centralized definitions, duration, source, stacking policy, removal triggers, and deterministic application order.
- Combat resolution must be deterministic and auditable; AI can recommend but never adjudicate.
- Positioning needs a neutral abstraction that can support grid, zones, range, line-of-sight, cover, reach, and movement costs without tying the engine to one UI.

### Spells and resources
- Model spells as data with casting time, targets, range, duration, components, resource cost, scaling, save/attack semantics, and concentration metadata.
- Concentration is a resource/state constraint with explicit start, replacement, interruption, and cleanup events.
- Resource systems should be generic enough for spell slots, charges, stamina, class features, items, and BLOODLINES-specific resources.

### Items, equipment, and crafting
- Separate item definitions from item instances.
- Equipment slots and requirements are deterministic constraints.
- Attunement/resource limits belong to the rules engine.
- Crafting should be recipe/data-driven with prerequisites, inputs, outputs, time, tools, and failure/quality rules.

### Quests, dialogue, factions
- Quests should be explicit state graphs with prerequisites, objectives, branches, failure states, rewards, and consequences.
- Dialogue should be declarative where possible: conditions select choices; validated actions mutate state.
- Factions should expose deterministic reputation/standing values and relationship edges; thresholds can unlock/lock content without embedding policy in prose.

### Companions and NPCs
- Persistent identity, goals, schedules, relationships, memories, resources, and current state live outside the LLM.
- Companion progression should use the same validated advancement machinery as player characters where possible.
- NPC simulation should run from a world clock/tick and produce structured events/actions.
- AI receives bounded context and returns typed proposals; the simulator validates them.

### Persistence and migration
- Use versioned snapshots/checkpoints plus authoritative event records where practical.
- Save data needs an explicit schema version and migration chain.
- Branch/rollback should restore a known snapshot and replay validated events; never reconstruct mechanics from prose or model memory.
- Interrupted actions must be transactional: either the state mutation fully commits or nothing commits.

### Procedural generation
- Generation should produce validated intermediate data structures, not directly mutate the world.
- Generated scenes/maps/encounters require schema validation and deterministic seeds where reproducibility matters.
- Content generation should be separated from placement, validation, and activation.

### AI evaluation and reliability
- Build deterministic regression tests for character creation, combat, spells, effects, quests, and saves.
- AI evaluations should measure tool correctness, rule adherence, invalid-action rate, state consistency, and recovery from rejected actions.
- Narrative-quality evaluation remains separate from mechanical correctness.

### Multiplayer and scale
- If multiplayer is enabled later, server-side authoritative state is required; clients submit intents, not arbitrary state mutations.
- Use event ordering/idempotency and transaction boundaries around shared state.
- Large NPC populations need scheduled simulation tiers rather than running every NPC at full fidelity every tick.
- Off-screen simulation can use lower-frequency/coarser updates, while player-adjacent entities receive higher fidelity.

### Accessibility and localization
- Core content must not depend on presentation-specific strings.
- Store stable identifiers and translatable text separately.
- Dialogue/menus/actions need keyboard/controller-compatible semantics and non-visual state descriptions.

### Content packs and modding
- Content packs should declare schema/game-version compatibility and dependencies.
- IDs need namespaces to avoid collisions.
- Load order and overrides must be deterministic and auditable.
- Rules/content packages should be validated before activation.

## Consolidated architecture conclusions

1. BLOODLINES rules are authoritative.
2. D&D 2024 is the preferred reference fallback.
3. D&D 2014 is a compatibility/reference fallback.
4. External books are reference sources; copyrighted book text is not copied into the repository.
5. The deterministic engine owns dice, math, validation, and state mutation.
6. AI/DM proposes structured actions and narrates authoritative results.
7. Rule lookup is read-only and cannot mutate game state.
8. AI context is bounded and explicitly selected.
9. Autonomous NPCs need schedules/goals plus persistent memories and relationships.
10. The world simulation owns time/ticks, locations, physical state, and triggers independently of narration.
11. AI actions require strict schemas and validation before execution.
12. Failed AI actions produce no partial state mutation.
13. Model/provider architecture is replaceable behind a common action contract.
14. Character/game content is data-driven and versioned.
15. Memory uses tiers and token budgets.
16. State mutations and AI/tool decisions are auditable.
17. Sessions have explicit lifecycle states and resumable checkpoints.
18. Combat AI inspects actions, resources, conditions, allies/enemies, and positioning before recommending actions.
19. World simulation supports autonomous events without requiring the player to be online.
20. Content packs/mods work without recompiling core rules.
21. Rules provenance distinguishes BLOODLINES from D&D reference material.
22. Deterministic tests gate mechanical correctness; LLM evaluation is advisory for prose quality.
23. Player/DM policy can confirm, skip, override, or reject AI-proposed actions.
24. Session failures pause safely, preserve state, and resume explicitly.
25. Narrative data is portable and content-driven.
26. Dialogue/quest conditions are declarative where practical, with validated action hooks for mutations.
27. Accessibility is designed into interaction/data formats.
28. Generated content is validated before entering authoritative state.
29. Shared-world state, if enabled, is server-authoritative and transactional.
30. NPC simulation uses fidelity tiers to scale large populations.

## Research complete: next phase

The open-ended research phase is finished. The next step is a **final BLOODLINES analysis/design pass** that compares these findings against the current repository and identifies:

- what existing BLOODLINES already satisfies;
- what should be retained;
- what should be redesigned;
- what borrowed implementation should be removed or rewritten;
- what D&D reference data should be imported;
- what new schemas/interfaces are actually required;
- and the implementation order.

No additional broad research is required unless the final analysis discovers a specific unresolved technical question.

## Licensing boundary

Researching an open-source project does not make its code part of BLOODLINES. For every candidate, verify its license before copying code. Prefer independently implementing general architectural ideas. Only redistribute source/content permitted by the applicable license. The D&D reference layer must remain provenance-aware and must not become a dump of copyrighted books.
