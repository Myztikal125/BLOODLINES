# BLOODLINES Research Roadmap

## Research completed so far

### AI DM / deterministic engine
- `Mortyl/ai-dungeon-master`: engine authority, structured tool calls, seeded dice, state constraints, deterministic objective evaluation.
- `xavibonell/mythweaver`: typed seams between LLM, rules engine, RAG, world/scene generation, and evaluation.
- `skeinkeeper/skeinkeeper`: four-tier context model (hot, warm, cold, episodic), auditability, behavior-as-data, plugin seams, explicit session lifecycle, and Foundry-as-authority patterns. Its architecture explicitly separates deterministic state mutation from LLM narration and says tool calls are the only world-changing path. 
- `shawnrushefsky/dmcp`: useful MCP/tool-surface reference; BLOODLINES should expose only authoritative, validated tools.
- `AI-DM-Foundry/AI-Combat-Assistant-Pf2e`: full-combat-state tactical recommendations, action/reaction/resource/condition awareness, confirmation/skip/override workflow, and explicit action tracking.

### Character creation / rules data
- `arrowedisgaming/OpenPentacle`: content-pack driven character creation; stateless engine functions; schema validation; auditable numeric bonuses; origin abstraction.
- D&D repositories: SRD-compatible structured data and versioned provenance.
- Foundry D&D 5e: activities, advancements, effects, actor/item modeling, and 2014/2024 compatibility patterns.
- 5e-bits / Open5e / 2024 SRD datasets: normalization/API patterns.
- Pathfinder 2e ecosystem: useful architectural patterns for actions, traits, conditions, prerequisites, and degrees of success; not a replacement ruleset.

### Living world / NPCs
- `binary-knight/usurper-reborn`: goal-driven autonomous NPCs, importance-weighted memory, relationships, lifecycle simulation, emergent events, companions, world news, JSON mod overlays.
- `LudicDynamics/WorldLines`: independent agents with private memory/agendas and a world orchestrator. Architecture research only where license does not permit direct reuse.

### Narrative
- `jeremyfa/loreline`: branching narrative/state/functions.
- `goflowspace/goflow`: node-based narrative authoring and world knowledge-base concepts; architecture research only unless license requirements are deliberately accepted.
- `katelouie/bardic`: portable structured branching/state story layer.

### Combat / simulation
- `jamesplotts/opencombatengine`: interface-driven combat, SRD-compatible mechanics, extensibility, test-first patterns.
- `Sheinort/CombatProcessingSystem`: combat entity lifecycle and request-processing pipeline.
- Pathfinder AI combat research: complete-state tactical reasoning and human override/confirmation.

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
12. Deterministic evaluations gate mechanical correctness; LLM judging is advisory for prose quality.
13. Content is data-driven and versioned rather than hardcoded into the UI.
14. World/NPC simulation can advance independently of player turns when enabled.
15. Visual/scene generation, if added, must use typed contracts and deterministic geometry rather than allowing the model to invent coordinates/pixels.
16. Combat AI may recommend actions, but a human/player/DM policy layer can confirm, skip, override, or reject them.
17. Provider and external-integration boundaries should be interfaces so BLOODLINES can change LLM, persistence, or UI without rewriting the game engine.
18. Session failures should pause safely, preserve state, and resume explicitly rather than partially applying actions.

## Research targets still open

- Complete D&D 2014 vs 2024 character option matrix.
- Full combat/condition interaction matrix.
- Spell/resource lifecycle and concentration.
- Inventory/equipment/attunement/crafting.
- Feat/prerequisite/advancement graph.
- Quest state machines and branching consequences.
- Faction/reputation simulation.
- Companion relationship/progression model.
- Persistent world tick and autonomous NPC scheduling.
- Save migration/versioning and branch reconstruction.
- Deterministic evaluation harness and regression corpus.
- Tactical spatial model.
- Optional scene/map generation contracts.
- Accessibility and localization architecture.
- Multiplayer/authoritative-server architecture if BLOODLINES becomes shared-world.
- Performance/persistence strategies for large NPC populations.

## Licensing boundary

Researching an open-source project does not make its code part of BLOODLINES. For each candidate, record its license before copying code. Prefer adapting general ideas and implementing them independently. Only redistribute source/content that the applicable license permits.
