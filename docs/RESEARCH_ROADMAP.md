# BLOODLINES Research Roadmap

## Research freeze status

**Status: Broad architecture survey substantially complete.**

The research phase has now covered the major engine, rules, character, AI-DM, NPC, narrative, combat, persistence, and content-authoring patterns identified for BLOODLINES. Remaining work is now primarily **specific verification/detail research**, not another broad search for an entirely different architecture.

## Research completed

### Rules / character creation
- D&D 2014/2024 SRD repositories: structured rules data, versioning and provenance.
- 5e-bits / Open5e / 2024 SRD datasets: normalized data/API patterns.
- Foundry D&D 5e: activities, advancements, effects, actor/item modeling, and 2014/2024 compatibility.
- OpenPentacle: content-pack-driven character creation, stateless rules functions, schema validation, auditable bonuses, origin abstraction.
- Pathfinder 2e ecosystem: actions, traits, conditions, prerequisites, degrees of success.
- Mutagen: modular playbooks, reusable moves/sections, content-driven character sheets, accessibility-aware publishing. Its README describes modular additions and a document-to-electronic-character-sheet pipeline. fileciteturn92file0

### AI DM / deterministic engine
- Mortyl/ai-dungeon-master: engine authority, structured tool calls, seeded dice, state constraints, deterministic objective evaluation.
- MythWeaver: typed seams between LLM, rules engine, RAG, world/scene generation and evaluation.
- Skeinkeeper: four-tier memory, auditability, behavior-as-data, plugin seams, explicit session lifecycle and deterministic state mutation.
- DMCP: MCP/tool-surface patterns.
- AI Combat Assistant PF2e: complete combat state, actions/reactions/resources/conditions, explicit action tracking and human confirmation/override.
- City AI simulation: deterministic world state separated from bounded AI decision generation.

### Living world / NPCs
- Usurper Reborn: autonomous NPC goals, personality, memory, relationships, lifecycle simulation, companions, factions, quests, achievements and mod/data overlays.
- WorldLines: independent agents with private memory/agendas and a world orchestrator.
- City AI simulation: world clock/state owned outside the AI; AI returns parseable actions.

### Narrative / dialogue
- Loreline: branching narrative/state/function patterns.
- GoFlow: node-based narrative and world-knowledge concepts.
- Bardic: portable structured branching/state story layer.
- `QueenChristina/gd_dialog`: MIT-licensed JSON dialogue system with branching choices, conditional dialogue, variable substitution, actions/signals, loops, inventory/world-variable integration, keyboard accessibility, and engine-independent JSON-oriented content. fileciteturn82file0

### Combat / simulation
- OpenCombatEngine: interface-driven combat, extensibility and test-first patterns.
- CombatProcessingSystem: combat entity lifecycle and request-processing pipeline.
- Pathfinder tactical AI research: complete-state action selection and human override.

### Persistence / world state
- Existing LoreKit/Loreline checkpoint and timeline patterns.
- Event/timeline research confirms that durable state should be reconstructible from authoritative events or versioned snapshots, with explicit migration rather than relying on AI context.

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
10. The world simulation owns time/ticks, locations, physical state and triggers independently of narration.
11. AI actions require strict schemas and validation before execution.
12. Failed AI actions must produce no partial state mutation.
13. Model/provider architecture should be replaceable behind a common action contract.
14. Character/game content should be data-driven and versioned.
15. Memory needs tiers and token budgets.
16. State mutations and AI/tool decisions should be auditable.
17. Sessions need explicit lifecycle states and resumable checkpoints.
18. Combat AI should inspect actions, resources, conditions, allies/enemies and positioning before recommending an action.
19. World simulation should support autonomous events without requiring the player to be online.
20. Content packs/mods should be possible without recompiling core rules.
21. Rules provenance must distinguish BLOODLINES from D&D reference material.
22. Deterministic tests gate mechanical correctness; LLM evaluation is advisory for prose quality.
23. Player/DM policy must be able to confirm, skip, override or reject AI-proposed actions.
24. Session failures must pause safely, preserve state and resume explicitly.
25. Narrative data should be portable and content-driven rather than tightly coupled to presentation code.
26. Dialogue/quest conditions should be declarative where practical, with validated action hooks for mutations.
27. Accessibility should be designed into interaction/data formats rather than added only to UI later.

## What remains before implementation

### Still needs detailed research / verification
- Complete 2014 vs 2024 **option-by-option** character matrix.
- Exact spell/resource/concentration interaction rules needed by BLOODLINES.
- Exact condition/effect stacking/removal semantics needed by the engine.
- Equipment/attunement/crafting edge cases.
- Quest graph schema and failure/branch semantics.
- Faction/reputation mathematical model.
- Companion relationship/progression model.
- World tick frequency and scheduling policy.
- Save migration format and version upgrade strategy.
- Deterministic regression corpus for combat/character creation.
- Tactical spatial representation (grid, zones, ranges, line of sight).
- Procedural scene/map generation contracts.
- Multiplayer authority requirements, if multiplayer remains in scope.
- Large-world persistence/performance limits.

These are **detail passes**, not blockers to choosing the overall architecture.

## Licensing boundary

Researching an open-source project does not make its code part of BLOODLINES. For every candidate, verify its license before copying code. Prefer independently implementing general architectural ideas. Only redistribute source/content permitted by the applicable license. The D&D reference layer must remain provenance-aware and must not become a dump of copyrighted books.
