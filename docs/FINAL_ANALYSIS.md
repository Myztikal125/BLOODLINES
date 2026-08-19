# BLOODLINES Final Architecture Analysis

## Scope

This analysis compares the current BLOODLINES repository against the completed research pass. It is a design gate: no broad new research is required unless a specific unresolved question appears below.

## Executive assessment

BLOODLINES already has a strong prototype foundation: data-driven content, character/rules infrastructure, quests, inventory, NPCs, companions, AI narration, a Rules Bible/compiler, save/load, and tests. The repository also has a useful set of research-derived additions on `feat/borrowed-engine-patterns`.

The main architectural problem is not lack of features. It is **boundary clarity**. The repository currently has overlapping `engine/` and `src/engine/` areas, command-driven mutation, direct mutable domain objects, a lightweight combat state, and AI/narration paths that are not yet fully separated from authoritative state mutation.

The final design should consolidate around one authoritative engine boundary rather than adding more parallel subsystems.

## KEEP

### 1. Data-driven rules/content
Keep the existing JSON/data approach. Character, bloodline, NPC, world, and other content should remain external to the core algorithms.

### 2. Rules Bible + compiled runtime
Keep the Rules Bible pipeline. The compiler validates its output and records the source SHA; runtime can require approved rules before enabling systems. This is valuable provenance and safety infrastructure.

### 3. BLOODLINES-first rule precedence
Keep the reference layer's intended hierarchy:

`BLOODLINES -> D&D 2024 reference -> D&D 2014 compatibility`

This should remain explicit and auditable.

### 4. Deterministic modifier/formula concepts
Keep `modifierEngine`, `formulaEngine`, and explicit modifier ordering as architectural foundations. They need expansion, not replacement.

### 5. Typed tool-contract concept
Keep `ToolRegistry`/tool-contract architecture. It correctly moves AI requests through a controlled interface. Before production, argument type/enum/range validation and authorization must be added.

### 6. Typed event bus concept
Keep the small event bus. It is useful for decoupling authoritative engine events from narration, logging, UI, AI context, and persistence.

### 7. Memory architecture
Keep the NPC memory tiering/retrieval concept. It should eventually sit behind a persistent store and explicit token/context budgets rather than being the authoritative source of world state.

### 8. Companion/NPC systems
Keep the existing companion and NPC work. It is aligned with the research and should be upgraded to use the future authoritative character/effect/event interfaces.

### 9. Existing quests, inventory, saves, and commands
Keep the player-facing capabilities. Refactor their internals rather than throwing away working gameplay behavior.

## REWORK

### 1. Combat
Current combat state is too small: it tracks an active flag and enemy array. It does not yet represent initiative, turns, actions, reactions, movement, resources, conditions, effects, targeting, or deterministic resolution. Replace this with an explicit combat-state model while preserving existing command APIs where practical.

### 2. Character creation
The new generic `CharacterCreationEngine` is a useful direction but is only validation/grant plumbing. It needs a typed option catalog, prerequisites, conflicts, ability-score rules, proficiencies, equipment, spells, advancement, provenance, and deterministic final-character construction.

### 3. Effects/modifiers
`ActiveEffect` is a useful starting point but currently allows arbitrary target paths and free-form condition strings. Introduce validated effect/condition identifiers, source/target semantics, duration events, stacking policies, and removal triggers. Do not let arbitrary strings become an implicit scripting language.

### 4. AI tool execution
`ToolRegistry` currently validates only required argument presence. Add schema validation, value/range/enum checks, permission/policy checks, idempotency where needed, transactional execution, and structured success/failure results.

### 5. DM orchestration
`DmOrchestrator` currently executes tools and emits an engine-result event, but it is not yet connected to the authoritative game engine as a transaction boundary. The DM should propose an action; the engine validates and commits it; only then should narration describe the result.

### 6. Sessions
`GameSession` is currently an in-memory event history with created/running/stopped states. Expand it later to persistent checkpoints and pause/resume, but do not treat this current class as a complete persistence solution.

### 7. Quest architecture
The existing `QuestManager` directly mutates quest objects and has a linear objective/completion model. Rework toward explicit quest state graphs, prerequisites, branches, failure states, consequences, and emitted domain events.

### 8. Save system
Keep existing save/load behavior, but move toward versioned schemas and transactional snapshots. The current in-memory timeline/checkpoint prototypes are not sufficient for rollback or reconstruction.

### 9. World/NPC simulation
Add an authoritative world clock/tick and scheduled simulation later. AI should receive bounded context and return structured proposals; it must not own time or persistent world state.

## REMOVE / DO NOT PROMOTE

### 1. Current `src/world/timeline.ts`
Do not promote this implementation. Its branch event retrieval does not reconstruct parent history, sequence numbering is tied to the global event array, and it does not provide true replay semantics. Remove from the production architecture and replace with a properly specified event/checkpoint design later.

### 2. Current `src/world/checkpoints.ts`
Do not treat the in-memory `Map` implementation as the save/rollback architecture. It is only a prototype. It should be removed from the production path until a versioned persistent snapshot design exists.

### 3. Duplicate engine roots
The repository currently has both `engine/...` and `src/engine/...` concepts. Do not add more systems to both. The final architecture needs one authoritative engine namespace. Existing compatibility paths should be migrated deliberately, then the duplicate layer removed.

### 4. Generic arbitrary target-path effects
Do not retain unrestricted `targetPath` mutation as a production mechanism. Use typed stat/resource/effect targets and controlled engine operations.

### 5. AI-authored mechanics
Do not allow prompts, narration, or generated JSON to become authoritative rules. AI can propose; the deterministic engine decides.

## EXISTING SYSTEMS THAT NEED NO NEW BROAD RESEARCH

- Basic data loading
- Current character model and factory pipeline
- Existing bloodline system
- NPC/relationship foundation
- Companion foundation
- Basic quest/inventory commands
- Rules Bible compilation/provenance
- Basic AI narration
- Current save/load behavior as a prototype

These need implementation/refactoring against the final architecture, not another repository survey.

## TARGET ARCHITECTURE

```text
                    BLOODLINES GAME
                          |
              +-----------+-----------+
              |                       |
        Content / Rules          Player / AI Intent
              |                       |
              +-----------+-----------+
                          |
                    Command / Action
                       Validator
                          |
                 Authoritative Engine
        +-----------------+-----------------+
        |                 |                 |
    Character          Combat            World
    Effects            Resources         Quests
    Items              Conditions        NPCs
    Progression        Spells            Factions
        |                 |                 |
        +-----------------+-----------------+
                          |
                     Domain Events
              +-----------+-----------+
              |           |           |
           Save/Log     AI Context   UI/Narration
```

The critical rule is that arrows toward the engine represent **validated intents**, not arbitrary state mutation.

## Remaining targeted research

Only these questions remain worth researching before implementation if their exact behavior is still undecided:

1. Exact D&D 2014/2024 option-by-option data that BLOODLINES actually wants to expose.
2. Exact condition/effect stacking semantics for the selected BLOODLINES rules profile.
3. Exact spell/resource/concentration interactions that are in scope.
4. Whether BLOODLINES uses grid, zones, or a hybrid tactical model.
5. Whether multiplayer is actually a product requirement; do not build multiplayer infrastructure until confirmed.
6. Persistence backend choice and expected world size, because these determine event/snapshot storage strategy.

Everything else is sufficiently researched to make an architectural decision.

## Recommended implementation order after this analysis

1. Consolidate the engine namespace/boundaries.
2. Define authoritative domain state and action/result contracts.
3. Finish character creation/progression data schemas.
4. Build deterministic conditions/effects/modifiers/resources.
5. Rebuild combat around those primitives.
6. Rework quests/factions/companions to emit domain events.
7. Integrate AI strictly through validated tool actions.
8. Add persistent memory and world scheduling.
9. Replace prototype checkpoint/timeline code with versioned persistence.
10. Build deterministic regression/evaluation suites.
11. Only then expand content, procedural generation, and richer DM behavior.
