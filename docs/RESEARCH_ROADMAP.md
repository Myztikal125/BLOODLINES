# BLOODLINES Research Roadmap

## Research completed so far

### AI DM / deterministic engine
- Mortyl/ai-dungeon-master: engine authority, structured tool calls, seeded dice, state constraints, deterministic objective evaluation.
- xavibonell/mythweaver: typed seams between LLM, rules engine, RAG, world/scene generation, and evaluation.
- skeinkeeper/skeinkeeper: four-tier context model (hot, warm, cold, episodic), auditability, behavior-as-data, plugin seams, explicit session lifecycle, and Foundry-as-authority patterns.
- shawnrushefsky/dmcp: useful MCP/tool-surface reference; BLOODLINES should expose only authoritative, validated tools.
- AI-DM-Foundry/AI-Combat-Assistant-Pf2e: full-combat-state tactical recommendations, action/reaction/resource/condition awareness, confirmation/skip/override workflow, and explicit action tracking.
- Rccrawler/city-ai-simulation: deterministic world client owns time/location/state while a separate AI service receives bounded context and returns parseable actions. MIT licensed.

### Character creation / rules data
- arrowedisgaming/OpenPentacle: content-pack driven character creation; stateless engine functions; schema validation; auditable numeric bonuses; origin abstraction.
- D&D repositories: SRD-compatible structured data and versioned provenance.
- Foundry D&D 5e: activities, advancements, effects, actor/item modeling, and 2014/2024 compatibility patterns.
- 5e-bits / Open5e / 2024 SRD datasets: normalization/API patterns.
- Pathfinder 2e ecosystem: useful patterns for actions, traits, conditions, prerequisites, and degrees of success; not a replacement ruleset.

### Living world / NPCs
- binary-knight/usurper-reborn: goal-driven autonomous NPCs, importance-weighted memory, relationships, lifecycle simulation, emergent events, companions, world news, JSON mod overlays.
- LudicDynamics/WorldLines: independent agents with private memory/agendas and a world orchestrator. Architecture research only where license does not permit direct reuse.
- Rccrawler/city-ai-simulation: deterministic world simulation separated from AI decision generation; useful for autonomous schedules and bounded NPC context.

### Narrative
- jeremyfa/loreline: branching narrative/state/functions.
- goflowspace/goflow: node-based narrative authoring and world knowledge-base concepts; architecture research only unless license requirements are deliberately accepted.
- katelouie/bardic: portable structured branching/state story layer.

### Combat / simulation
- jamesplotts/opencombatengine: interface-driven combat, SRD-compatible mechanics, extensibility, test-first patterns.
- Sheinort/CombatProcessingSystem: combat entity lifecycle and request-processing pipeline.
- Pathfinder AI combat research: complete-state tactical reasoning and human override/confirmation.

## Architecture conclusions

1. BLOODLINES rules are authoritative.
2. D&D 2024 is the preferred reference fallback.
3. D&D 2014 is a compatibility/reference fallback.
4. External books are reference sources; their text is not copied into the repository.
5. The deterministic engine owns dice, math, validation, and state mutation.
6. AI/DM proposes structured actions and narrates authoritative results.
7. Rule lookup is read-only and cannot mutate game state.
8. AI context is bounded and explicitly selected rather than dumping the world into prompts.
9. Autonomous NPCs need schedules/goals plus persistent memories and relationships.
10. The world simulation needs its own clock/tick model independent of player narration.
11. AI actions require strict schemas and validation before execution.
12. Failed AI actions must be rejected without partial state mutation.
13. Provider/inference architecture should be replaceable; local and remote models can share an action contract.
14. Character/game content should be data-driven and versioned.
15. Memory needs distinct tiers and token budgets.
16. State mutations and tool calls should be auditable.
17. Sessions need explicit lifecycle states and resumable checkpoints.
18. Combat AI should inspect available actions, resources, conditions, allies/enemies, and positioning before recommending actions.
19. World simulation should support autonomous events without requiring the player to be online.
20. Content packs/mods should be possible without recompiling the engine.
21. Rules provenance must distinguish BLOODLINES rules from D&D reference material.
22. Deterministic evaluations gate mechanical correctness; LLM judging is advisory for prose quality.
23. Human/player/DM policy must be able to confirm, skip, override, or reject AI-proposed actions.
24. Session failures must pause safely, preserve state, and resume explicitly.

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
