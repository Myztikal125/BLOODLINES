# BLOODLINES Architecture Audit

## Cleanup pass

Branch: `feat/borrowed-engine-patterns`

### Removed
- `engine/game/gameController.backup.ts` — obsolete backup copy of the controller.
- `patch_gamecontroller.sh` — one-off text patch script; source changes belong in versioned TypeScript.
- `add_talk.sh` — one-off text patch script; source changes belong in versioned TypeScript.
- `debug-wizard.ts` — obsolete one-off debug entry point; use tests or the normal runtime.
- Previously removed prototype `src/world/timeline.ts` and `src/world/checkpoints.ts` remain absent because they did not provide real reconstruction/persistence semantics.

### Retained intentionally
- `engine/` remains the active game/runtime layer. `src/` contains newer services and the application entry point; this is currently an architectural seam to resolve, not something to delete blindly.
- `data/` remains authoritative content storage.
- `src/rules/reference/` remains the provenance-aware D&D reference layer.
- Rules Bible compilation remains because it validates runtime rule data and records the source hash.
- AI tool contracts, event bus, modifier engine, NPC memory, companions, world services, save manager, and existing commands remain as foundations pending deeper integration.

## Important structural finding

The repository currently has two overlapping engine namespaces:

- `engine/*` — active game runtime, character/combat/rules/save/world/inventory/progression/game commands.
- `src/engine/*` — newer deterministic utilities and data/rules services.

`src/index.ts` explicitly imports the active runtime from `engine/*` while using newer services under `src/*`. Therefore a wholesale deletion or automatic move would be unsafe. The next architecture task should define a single canonical runtime boundary and migrate incrementally with tests.

## Canonical boundary we are targeting

```text
Input / AI / DM intent
        |
        v
Action contract + validator
        |
        v
Authoritative BLOODLINES engine
  |        |        |
Character Combat   World
  |        |        |
  +--------+--------+
           |
        Domain event
       /     |      \
     Save    AI     UI/Narration
```

The AI must not directly mutate authoritative state. The rules engine owns validation, dice/math, resources, effects, and state transitions.

## Cleanup rule going forward

Do not add `.backup.ts`, one-off patch shell scripts, or ad-hoc debug entry points to the production tree. Temporary experiments belong in tests or isolated research artifacts.

## Next work after cleanup

1. Establish canonical module ownership between `engine/*` and `src/*`.
2. Add type-safe action/intent contracts around state-changing commands.
3. Strengthen validation boundaries before expanding character/combat content.
4. Then migrate character creation and combat onto the canonical rules layer.
