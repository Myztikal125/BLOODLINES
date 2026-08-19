# BLOODLINES Combination Catalog

This catalog defines a curated discovery layer for class + power-theme + Bloodline combinations. It is intentionally limited to 24 recognizable combinations rather than attempting to enumerate every possible build.

These are **future unlock previews**. Players can see the name, identity, and broad result before unlocking the complete mechanics. Exact numbers, costs, and trigger formulas remain rules-engine concerns.

## Design Rules

- Classes provide the foundation.
- Abilities provide components and tags.
- Spells provide magical effects and tags.
- Bloodlines provide mutation rules and evolution paths.
- Ancestries and backgrounds can add prerequisites, modifiers, or alternative routes.
- A combination is an unlockable interaction, not necessarily a subclass.
- The same Bloodline can produce different results with different classes.
- Exact mechanics should be unlocked/discovered through progression rather than exposing every implementation detail immediately.

## 24 Curated Combination Previews

| ID | Combination | Preview | Core Loop |
|---|---|---|---|
| flameguard | Support + Fire + Emberborn | **Flameguard** — protective wards become burning barriers; damage absorbed by the ward feeds Heat into the protected ally and the caster. | Shield -> Heat -> Rage/Spell Power -> Fire Funnel |
| cinderwarden | Cleric + Fire + Emberborn | **Cinder Warden** — divine protection carries sacred flame, burning attackers while converting protection into restorative heat. | Protect -> Burn -> Recover -> Radiant Flame |
| infernal_sentinel | Paladin + Fire + Emberborn | **Infernal Sentinel** — defensive auras ignite enemies that strike allies and convert absorbed punishment into a retaliatory smite. | Guard -> Punish -> Heat -> Smite |
| ashblade | Fighter + Fire + Emberborn | **Ashblade** — weapon attacks leave heat marks that erupt when the fighter changes targets. | Mark -> Stack Heat -> Detonate |
| wildfire_stalker | Ranger + Fire + Emberborn | **Wildfire Stalker** — marked prey spreads controlled flame between nearby targets. | Hunt -> Mark -> Spread -> Reposition |
| furnace_berserker | Barbarian + Fire + Emberborn | **Furnace Berserker** — incoming punishment increases internal Heat; Rage converts it into explosive melee attacks. | Take Damage -> Heat -> Rage -> Eruption |
| ember_dancer | Monk + Fire + Emberborn | **Ember Dancer** — movement techniques leave brief ignition zones and reward uninterrupted mobility. | Move -> Strike -> Ignite -> Move |
| cinder_song | Bard + Fire + Emberborn | **Cinder Song** — performance builds a shared rhythm of Heat that empowers allies' next elemental attack. | Inspire -> Heat Rhythm -> Empower |
| verdant_inferno | Druid + Fire + Emberborn | **Verdant Inferno** — plant and flame effects combine into living burning terrain. | Grow -> Ignite -> Control Terrain |
| flameweaver | Wizard + Fire + Emberborn | **Flameweaver** — fire spells can be threaded through barriers and allies without harming protected targets. | Shape Fire -> Protect -> Redirect |
| umbral_bastion | Support + Shadow + Shadowveil | **Umbral Bastion** — barriers absorb attacks and release darkness that blinds or obscures attackers. | Shield -> Absorb -> Veil |
| nightblade | Rogue + Shadow + Shadowveil | **Nightblade** — stealth attacks build Veil charges that can be spent to disappear between strikes. | Hide -> Strike -> Veil -> Reposition |
| eclipse_mage | Wizard + Shadow + Shadowveil | **Eclipse Mage** — arcane spells can be folded into darkness, changing their range and control behavior. | Cast -> Veil -> Distort Spell |
| duskwarden | Ranger + Shadow + Shadowveil | **Duskwarden** — marked enemies become easier to track through darkness while shadow arrows weaken their defenses. | Mark -> Track -> Debilitate |
| void_disciple | Monk + Shadow + Shadowveil | **Void Disciple** — movement and attacks create short-lived gaps that let the monk slip through danger. | Evade -> Gap -> Counter |
| grave_saint | Cleric + Shadow + Shadowveil | **Grave Saint** — protective magic can interact with death and dying, turning fallen allies into temporary sources of shadow power. | Protect -> Death State -> Recover/Empower |
| blood_knight | Fighter + Blood + Bloodline | **Blood Knight** — wounds become a resource for weapon techniques and controlled retaliation. | Wound -> Store -> Strike |
| crimson_martyr | Support + Blood + Bloodline | **Crimson Martyr** — the support can redirect part of an ally's damage onto themselves and convert suffering into stronger restoration. | Sacrifice -> Store Pain -> Heal |
| storm_reaver | Ranger + Lightning + Storm Bloodline | **Storm Reaver** — attacks chain through marked enemies and reward movement between targets. | Mark -> Strike -> Chain -> Move |
| thunder_chant | Bard + Lightning + Storm Bloodline | **Thunder Chant** — songs accumulate static charge that can be discharged through allies' attacks. | Inspire -> Charge -> Discharge |
| tempest_paladin | Paladin + Lightning + Storm Bloodline | **Tempest Paladin** — divine strikes call lightning onto enemies already affected by the paladin's aura. | Aura -> Mark -> Smite -> Lightning |
| frostbinder | Wizard + Cold + Frost Bloodline | **Frostbinder** — control spells build Chill, eventually freezing enemies or creating defensive ice structures. | Chill -> Slow -> Freeze/Create Cover |
| beastwarden | Ranger + Druid + Wild Bloodline | **Beastwarden** — hunting marks and shapeshifting cooperate, allowing the character to alternate between scout, predator, and guardian roles. | Mark -> Transform -> Hunt |
| bloodfire_ascendant | Wizard + Blood + Emberborn | **Bloodfire Ascendant** — health and Heat can be converted into volatile spell amplification at significant risk. | Sacrifice -> Heat -> Amplify -> Detonate |

## Discovery Presentation

Before unlock, the player should see:

- Combination name
- Required themes/classes/Bloodline
- One-sentence fantasy description
- Broad combat loop
- Status: `LOCKED`, `DISCOVERABLE`, or `UNLOCKED`

After unlock, reveal:

- Component abilities
- Component spells
- Bloodline mutation
- Trigger conditions
- Resource interactions
- Upgrade branches

Do **not** reveal every hidden interaction before discovery. The catalog is meant to create anticipation while preserving experimentation.

## Future Dual-Class Compatibility

The catalog is designed so future dual-classing can reuse the same interaction model. A dual-class build should not require a completely separate rules system; it should provide additional tags and prerequisites that can qualify the character for hybrid combinations.
