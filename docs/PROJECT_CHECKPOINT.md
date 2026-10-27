# BLOODLINES RPG - Project Checkpoint

## Current Status

Last Updated: 2026-10-27

## Combat Attack Path Audit

### Approved rules applied
- Attack resolution uses a d20 plus supported attack bonus/modifier fields versus target Armor Class.
- Damage is rolled only after a hit; a miss leaves target HP unchanged.
- The legacy resolver supports both `hitPoints` and `currentHitPoints` target data shapes.
- `AttackAction`, `EnemyAI`, and `CombatCommand` now report hit/miss results from the shared legacy resolver.
- No stamina cost was added; the Rules Bible does not authorize one.
- No new natural-1 miss rule or new damage die was introduced. The legacy path retains its existing 1d8 damage range.

### Files changed
- `engine/combat/actionResolver.ts`
- `engine/combat/actions.ts`
- `engine/combat/enemyAI.ts`
- `engine/game/commands/combatCommand.ts`
- `tests/combatLoop.test.ts`

### Regression coverage added
- AC miss causes no damage and does not call the damage roller.
- Attack meeting AC applies dice damage.
- Enemy records using `currentHitPoints` are supported.
- Missing target AC fails closed instead of silently applying damage.

## Validation Status

- GitHub Actions run for initial combat audit commit `a3e04f1` failed because the pre-existing `tests/enemyAI.test.ts` player fixture omitted Armor Class, which the approved AC-based attack resolver now requires.
- Corrected the test fixture to include `armorClass: 10`; no combat rule or runtime fallback was weakened.
- Verified GitHub Actions run [#21](https://github.com/Myztikal125/BLOODLINES/actions/runs/40562314061) on commit `92719e769fb48a8afed29fe14375c276a66df5ed`: **success**. `npm ci` completed and `npm test -- --run` passed **19 test files / 50 tests**.
- Local test execution remains unavailable in this environment because direct GitHub clone DNS resolution failed. The successful GitHub-hosted CI run is the verification source.
- npm reported 7 dependency audit vulnerabilities (2 moderate, 3 high, 2 critical); dependency upgrades were not part of this scoped combat fix and were not applied.

## Development Constraints
- Rules Bible and human-approved decisions remain authoritative.
- Do not invent mechanics where rules are unresolved.
- Keep future changes scoped and test-driven.

## Save/Load Integrity Follow-up

- Removed the terminal loop's shallow automatic save, which could overwrite the richer campaign snapshot with empty quest/event collections and hard-coded zero gold after ordinary commands. Saving is now explicit through the existing `save` command.
- Startup now loads through the shared `engine/save/SaveManager` format and passes the loaded snapshot into `GameController`.
- `GameController` restores progression, world snapshot fields, inventory, and current location at startup instead of only restoring the character object.
- Added `tests/saveLoad.test.ts`: missing-file behavior, full save round-trip, and startup restoration coverage.
- GitHub Actions run [#24](https://github.com/Myztikal125/BLOODLINES/actions/runs/40562778074) passed: **20 test files / 53 tests**.
- Remaining boundary: quest runtime objects are not persisted by the existing `SaveData` schema; this change preserves the existing string-based `world.activeQuests` snapshot without inventing quest serialization mechanics.

