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

## Inventory, Spell, and Encounter Expansion — 2026-10-27

### Inventory
- Expanded `data/items/items.json` from 3 to 13 entries, including weapons, armor, consumables, adventuring gear, and spellcrafting ingredients.
- Added optional item metadata for rarity, description, weight, effects, and Armor Class while retaining legacy item fields.
- Added `ItemLoader` so `add-item` can add catalogue entries by ID or name with their data intact; non-catalogue custom items remain supported.
- Inventory now validates positive whole-number stack quantities, supports partial stack removal, resolves names case-insensitively, removes by ID or name, and displays useful metadata.
- Commands accept quantities, e.g. `add-item 3 Health Potion` and `remove-item 1 Health Potion`.

### Spells
- Expanded `data/spells/spells.json` from 3 to 14 spells across Evocation, Conjuration, Abjuration, and Divination.
- Spell execution now rolls the listed dice expression instead of a generic d8, supports both `hitPoints` and `currentHitPoints`, clamps damage at zero HP, applies listed healing, and respects a known maximum HP field.
- Connected the existing `SpellCaster` slot rules to spell execution. Level-0 spells remain free; current configured level-1 slots are consumed only after target/effect validation succeeds.
- Registered the `cast` command with live combat target resolution. `cast spell_id` targets the first living enemy; `cast spell_id self` targets the character; `cast spell_id Enemy Name` selects a named combat enemy.
- Utility spell entries are catalogue/narrative-only for now: Mage Armor, Shield, and Detect Magic do not yet apply mechanics. Spell schools, signature spell exceptions, material components, spellcrafting, and school bonuses still need explicit mechanics approval before implementation.

### Enemies and Encounters
- Expanded `data/monsters/monsters.json` from 3 to 12 monsters, adding optional habitat, description, and tactics notes for future adaptive AI.
- Encounter generation now validates positive party level/size, uses monster challenge as a conservative eligibility ceiling against party level, avoids duplicate picks when enough eligible monsters exist, and fails clearly if the catalogue is empty.
- This is not a full encounter XP-budget calculator; no unapproved XP or reward mechanics were added.

### Verification
- Full CI run [#26](https://github.com/Myztikal125/BLOODLINES/actions/runs/40572816357) passed after the spell-slot and target-aware command coverage was added: **22 test files / 71 tests**.
- GitHub Actions installed locked dependencies and completed `npm test -- --run` successfully on the checkpoint commit. The local clone limitation remains; hosted CI is the verification source.
- npm continues to report 7 dependency audit vulnerabilities (2 moderate, 3 high, 2 critical); no dependency upgrades were mixed into this feature batch.


## Spell Execution Safety Follow-up — 2026-10-27

- Updated `SpellExecutor` to fail closed for catalogue spells without implemented mechanics rather than reporting a successful cast with no effect.
- Unsupported effects now return a clear message and do not consume a spell slot. This currently covers Mage Armor, Shield, and Detect Magic.
- Added regression coverage for all three unsupported spell entries and verified the same executor still has both configured first-level slots available after each rejected attempt.
- This is a safety/correctness fix, not an implementation of the missing effects. Shield reaction timing/AC bonus, Mage Armor AC/duration, and Detect Magic range/duration remain unimplemented because those mechanics are not specified by approved decisions.
- GitHub Actions verification is pending for commits `90bf983` and `8c2c1f5`; do not treat this follow-up as verified until the workflow passes.
