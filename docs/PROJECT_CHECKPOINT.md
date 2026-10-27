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

- Repository edits were committed directly to `main`.
- Local test execution: NOT RUN. This environment could not resolve github.com to clone the repository, so dependencies and the Vitest suite were not available locally.
- GitHub Actions: NOT VERIFIED. The GitHub connector returned no workflow runs and no combined status checks for the final test commit; this is not evidence that tests passed.
- Therefore this is an implementation checkpoint, not a green-test/verified-release checkpoint. Recheck GitHub Actions and run `npm test -- --run` in a network-enabled checkout before treating the combat fix as verified.

## Development Constraints
- Rules Bible and human-approved decisions remain authoritative.
- Do not invent mechanics where rules are unresolved.
- Keep future changes scoped and test-driven.
