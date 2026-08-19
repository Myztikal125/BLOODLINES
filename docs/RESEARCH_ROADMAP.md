# BLOODLINES Research Roadmap

## Research completed in this pass

### AI DM / deterministic engine
- `Mortyl/ai-dungeon-master`: strongest pattern is engine authority, structured tool calls, seeded dice, state constraints, and deterministic objective evaluations. The LLM narrates but never owns state.
- `xavibonell/mythweaver`: reinforces typed seams between LLM, rules engine, RAG, world/scene generation, and evaluation. Its rules RAG is for lookup/narration, not mechanical adjudication.
- `skeinkeeper/skeinkeeper`: useful four-tier context model (hot, warm, cold, episodic), auditability, behavior-as-data, plugin seams, and explicit session lifecycle.
- `shawnrushefsky/dmcp`: useful MCP/tool-surface reference for a DM, but BLOODLINES should expose only authoritative, validated tools.

### Character creation
- `arrowedisgaming/OpenPentacle`: content-pack driven character creation; pure stateless engine functions; schema validation; auditable numeric bonuses; origin abstraction. Strong match for BLOODLINES.
- Existing D&D repositories: use SRD-compatible structured data and versioned provenance; do not copy non-redistributable book text.

### Living world / NPCs
- `binary-knight/usurper-reborn`: useful ideas for goal-driven autonomous NPCs, importance-weighted memory, relationships, lifecycle simulation, emergent events, companion permanence, world news, and JSON mod overlays. These should be adapted selectively; BLOODLINES should not inherit unrelated romance/family mechanics unless explicitly designed.
- `LudicDynamics/WorldLines`: useful concept of independent agents with private memory/agendas and a world orchestrator. License is not suitable for copying the engine core, so treat as architectural research only.

### Narrative
- `jeremyfa/loreline`: branching narrative/state/functions as a portable story layer.
- `goflowspace/goflow`: visual/node-based narrative authoring and world knowledge-base concepts. AGPL; architecture only unless license requirements are deliberately accepted.
- `katelouie/bardic`: portable story layer with structured branching and programmable state.

### Combat
- `jamesplotts/opencombatengine`: interface-driven combat, SRD-compatible mechanics, TDD emphasis, and extensibility. Useful for design/testing patterns, not wholesale language/runtime porting.
- `Sheinort/CombatProcessingSystem`: combat entity lifecycle, stat/resource resolution, request-processing pipeline. Useful as a conceptual pipeline reference.
- Pathfinder 2e research remains useful for action economy, traits, conditions, prerequisites, and degree-of-success design, but does not replace BLOODLINES/D&D rules.

## Architecture decisions for BLOODLINES

1. BLOODLINES rules are authoritative.
2. D&D 2024 is the preferred reference fallback.
3. D&D 2014 is a compatibility/reference fallback.
4. External books are reference sources; their text is not copied into the repository.
5. The deterministic engine owns dice, math, validation, and state mutation.
6. The AI/DM proposes structured actions and narrates authoritative results.
7. Rule lookup is read-only and cannot mutate game state.
8. Behavior/prompt guidance is data, separate from mechanics.
9. Persistent state is not treated as prompt memory.
10. Memory is tiered: hot, warm, cold, episodic.
11. State mutations and tool calls are auditable.
12. Deterministic evaluations must gate mechanical correctness; LLM judging is advisory for prose quality.
13. Content is data-driven and versioned rather than hardcoded into the UI.
14. World/NPC simulation is modular and can advance independently of player turns when enabled.
15. Visual/scene generation, if added, must use typed contracts and deterministic geometry rather than allowing the model to invent coordinates/pixels.

## Next research targets

- D&D 2014 vs 2024 complete character option matrix.
- Full combat/condition interaction matrix.
- Spell/resource lifecycle.
- Inventory/equipment/attunement.
- Feat/prerequisite/advancement graph.
- Quest state machines and branching consequences.
- Faction/reputation simulation.
- Companion relationship/progression model.
- Persistent world tick and autonomous NPC scheduling.
- Save migration/versioning and branch reconstruction.
- Deterministic eval harness and regression corpus.
- Tactical spatial model.
- Optional scene/map generation contracts.

## Licensing boundary

Researching an open-source project does not make its code part of BLOODLINES. For each candidate, record its license before copying code. Prefer adapting general ideas and implementing them independently. Only redistribute source/content that the applicable license permits.
