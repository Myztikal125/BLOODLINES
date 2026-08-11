# Lyra Vey — Level 1 Companion Build Proposal

**Status: PROPOSED — NOT YET APPROVED**

This is the first Character Architect design pass for Lyra Vey. The approved roster remains authoritative for her identity and base statistics. This document proposes her mechanical kit for review.

## 1. Locked Foundation

- **Name:** Lyra Vey
- **Ancestry:** Human
- **Class:** Wizard
- **Background:** Scholar
- **Level:** 1
- **Role:** Arcane Damage / Investigation
- **STR:** 8
- **DEX:** 12
- **CON:** 10
- **INT:** 16
- **WIS:** 13
- **CHA:** 11
- **HP:** 7
- **AC:** 10
- **Stamina:** 10
- **Proficiency:** +2
- **Personality:** Curious, driven, analytical
- **Values:** Knowledge, discovery, truth
- **Flaw:** Will risk herself for an unanswered question.
- **Backstory:** The scholar who disappeared while investigating the Bloodglass Sanctum.
- **Motivation:** Recover her research and discover the truth about awakened bloodlines.
- **Recruitment:** Shadow has to rescue her and prove he isn't simply another person hunting the Bloodglass secrets.

## 2. Design Identity

### Fire + Rage

Lyra is a Wizard whose magical identity is built around ancient flame and escalating emotional intensity.

Her central loop is:

**Cast / engage → generate Rage → Rage increases damage → manage Rage against Stamina → decide when to spend or preserve Rage.**

Rage is not the ordinary D&D Barbarian Rage feature. It is a BLOODLINES custom resource attached to Lyra's fire-based magic.

## 3. Bloodline

### Emberborn Bloodline

**Source:** Existing BLOODLINES data.

Current repository definition:
- Fire Resistance
- Flame Affinity

The Emberborn bloodline is the natural existing bloodline fit for Lyra's approved Fire + Rage concept. No new bloodline is invented for this proposal.

### Emberborn — Level 1 integration

**Fire Resistance:** Retain the existing bloodline effect.

**Flame Affinity:** Treat as the hook that allows Lyra's fire spells and Rage system to interact. Exact numerical effect should be implemented only after balance testing.

## 4. Rage Resource — Proposed BLOODLINES Mechanic

### Rage Pool

- **Current Rage:** 0 at the start of an encounter unless another approved rule says otherwise.
- **Maximum Rage:** Lyra's current **Stamina**.
- At Level 1, Lyra has **10 Stamina**, therefore **maximum Rage = 10**.
- Rage can never exceed current maximum Stamina.
- If Lyra's maximum Stamina is reduced, current Rage cannot remain above the new maximum.

### Rage Damage Scaling — Proposed

Fire damage increases as Rage rises. To avoid an unbounded linear damage bonus, this first proposal uses tiers:

| Rage | Fire Damage Bonus |
|---:|---:|
| 0–2 | +0 |
| 3–4 | +1 |
| 5–6 | +2 |
| 7–8 | +3 |
| 9 | +4 |
| 10 | +5 |

This is a **balance proposal**, not an approved final formula.

### Rage Generation — Proposed Starting Rules

Lyra gains Rage when her fire magic meaningfully engages with combat:

- **Fire cantrip/spell hits:** +1 Rage, once per spell resolution.
- **A fire spell deals damage to multiple creatures:** still only +1 Rage from that cast, preventing easy multi-target farming.
- **Critical hit with a fire spell:** +1 additional Rage.
- **Taking fire damage:** +1 Rage once per damaging event, subject to a per-turn limit.
- Rage cannot exceed Stamina.

The exact generation rate is subject to playtesting.

## 5. Rage Management

Lyra should have meaningful choices instead of simply maximizing Rage.

### Hold the Heat

Preserve Rage to maintain higher fire damage.

### Vent the Flame

A proposed mechanic for later levels that spends Rage for a stronger immediate effect. This is intentionally **not a Level 1 feature yet** unless testing shows she needs an active Rage sink.

### Overheat Risk

No uncontrolled self-damage is included at Level 1. A future high-Rage mechanic may introduce risk, but it must be earned through progression rather than making the Level 1 character frustrating.

## 6. Level 1 Wizard Package

The build follows the BLOODLINES Wizard research: Intelligence-based spellcasting, spellbook, cantrips, spell slots, ritual casting, and bloodline interaction.

### Proposed Cantrips

1. **Fire Bolt** — primary ranged fire attack and Rage generator.
2. **Produce Flame / Elementalism-style fire utility** — fire manipulation and exploration utility, depending on the exact spell data available in the engine.
3. **Mage Hand** — investigation and utility.
4. **Minor Illusion** — investigation, distraction, and creative problem solving.

The final exact spell IDs must match the project's spell data.

### Proposed Level 1 Spells

Initial spellbook emphasis:

- **Burning Hands** — close-range burst and high-Rage payoff.
- **Chromatic Orb** — flexible damage, with Fire selected when appropriate.
- **Detect Magic** — Bloodglass investigation.
- **Identify** — artifact and Bloodglass research.
- **Find Familiar** — investigation and scouting.
- **Shield** — basic Wizard survival.

The final prepared list and exact spell implementation must be reconciled with the project's existing spell data and the selected 2014/2024 hybrid rules.

## 7. Proposed Level 1 Features

### ⭐ Emberborn Flame Affinity

Lyra's Emberborn lineage makes her fire magic unusually compatible with her Rage resource.

**Proposed effect:** qualifying fire damage uses Lyra's current Rage tier when determining bonus fire damage.

### ⭐ Scholar of the Bloodglass

A background/companion feature focused on investigation rather than raw combat power.

**Proposed capabilities:**
- identify magical traces;
- recognize Bloodglass-related symbols or terminology;
- recall relevant arcane lore;
- investigate magical anomalies using Intelligence.

This should not grant automatic answers. It should improve the quality of information Lyra can obtain.

### ⭐ Controlled Ignition

Lyra has learned to deliberately trigger her Emberborn power.

**Proposed effect:** once per turn when Lyra successfully deals fire damage with a spell, she can gain Rage if below her Stamina maximum.

This is the main Level 1 engine for the Fire + Rage loop.

## 8. Combat Role

**Primary:** Ranged magical damage

**Secondary:** Investigation / magical identification

**Weakness:** Low HP and AC mean she cannot safely remain in melee.

### AI priorities

1. Stay at useful casting range.
2. Build Rage safely.
3. Prefer fire spells when Rage scaling makes them efficient.
4. Avoid wasting high-level resources on low-value targets.
5. Preserve defensive options when threatened.
6. At high Rage, seek a high-value fire damage opportunity.
7. Do not blindly maximize Rage if doing so risks Lyra's survival.

## 9. Investigation Role

Lyra's companion identity must work outside combat.

Potential investigation actions:

- **Analyze Bloodglass:** inspect Bloodglass-related objects or locations.
- **Arcane Trace:** determine whether recent magic passed through an area.
- **Research Memory:** use known lore to connect discovered clues.
- **Sanctum Expertise:** recognize patterns connected to the Bloodglass Sanctum.

These should integrate with the existing investigation/world systems rather than become a parallel quest system.

## 10. Fire + Rage Combos

### Combo A — Build the Flame

Fire Bolt → gain Rage → subsequent fire damage becomes stronger.

### Combo B — Close Burst

Build Rage safely → Burning Hands against multiple enemies → high-value fire burst.

### Combo C — Critical Ignition

Fire spell critical → additional Rage → stronger follow-up fire spell.

### Combo D — Investigation to Combat

Identify a magical/fire vulnerability → select the appropriate fire spell → exploit Rage scaling.

## 11. D&D Rules Integration

### BLOODLINES priority

Custom BLOODLINES rules override conflicts.

### D&D 2024

Use the revised Wizard structure where it fits the engine. The 2024 Wizard keeps Intelligence as its core spellcasting ability and adds/adjusts features such as Ritual Adept and spellbook handling. citeturn0search3

### D&D 2014

Use 2014 Wizard mechanics where they better support existing BLOODLINES implementation or compatibility.

### Hybrid

The Rage resource is explicitly a **BLOODLINES hybrid mechanic**, not a claim that Lyra has the Barbarian class feature.

## 12. Balance Review — Initial

**Strengths**
- Clear identity.
- Scales with an existing character resource.
- Fire resistance gives her thematic defense.
- Rage cap prevents infinite accumulation.
- Low HP/AC provides a natural counterweight.

**Risks**
- Damage bonus could scale too quickly.
- Multi-target spells could generate Rage too efficiently.
- Rage may become mandatory instead of a meaningful choice.
- Fire resistance plus Rage generation from fire damage could create unintended loops.

**Required tests**
- single-target damage at Rage 0/5/10;
- multi-target Rage generation;
- critical-hit generation;
- Stamina reduction while Rage is high;
- long-fight resource behavior;
- short-fight burst behavior;
- comparison against a standard Level 1 Wizard.

## 13. Implementation Classification

### Existing repository mechanics reused
- Wizard framework
- Intelligence-based casting
- Bloodline system
- Emberborn bloodline
- Fire Resistance
- Flame Affinity
- Spellbook/spell progression concepts
- Stamina resource

### Proposed new mechanics
- Rage resource for Lyra
- Rage capped by Stamina
- Rage-based fire damage scaling
- Rage generation rules
- Controlled Ignition
- Bloodglass investigation features

### Implementation required
- Character state Rage field
- Rage cap derived from Stamina
- Rage gain/loss events
- Damage modifier hook
- Fire-damage detection
- UI/character display of Rage
- Combat tests
- Save/load serialization

## 14. Approval Gate

**This build is not canonical yet.**

Shadow must approve or reject:

- Rage scaling
- Rage generation
- Spell list
- Emberborn integration
- Level 1 features
- Investigation features
- Combat AI priorities

Only approved mechanics should be moved into canonical character data or production engine code.
