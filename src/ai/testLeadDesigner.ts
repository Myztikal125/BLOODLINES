import fs from "fs";
import { askAI } from "./aiClient";

async function main() {

  const rulesBible = fs.readFileSync(
    "docs/RULES_BIBLE.md",
    "utf8"
  );

  const context = `
BLOODLINES CURRENT RULES BIBLE:

${rulesBible}

The existing BLOODLINES TypeScript engine contains implemented
systems for characters, combat, equipment, encounters, enemies,
progression, quests, NPCs, relationships, memory, world state,
and AI systems.

Do NOT invent implementation details that are not supported by
the supplied project.

The purpose of this audit is to identify what the RULES BIBLE
must define before the AI development assistants build more game
content.
`;

  const result = await askAI(
`${context}

You are the BLOODLINES Lead Rules Designer.

Your job is to perform a mechanical RULES AUDIT.

The RULES BIBLE is authoritative.

Do NOT create quests.
Do NOT create NPCs.
Do NOT create monsters.
Do NOT create classes.
Do NOT create bloodlines.

Instead determine what rules are fully defined, partially defined,
or missing.

Audit these systems:

1. Ability scores
2. Skills and proficiency
3. Advantage and disadvantage
4. Actions and action economy
5. Initiative
6. Combat rounds
7. Attacks
8. Damage
9. Armor Class
10. Conditions
11. Death and dying
12. Rest and recovery
13. Spellcasting
14. Spell slots
15. Signature spells
16. Spellcrafting
17. Bloodlines
18. Dual Bloodlines
19. Bloodline evolution
20. Bloodline curses
21. XP and leveling
22. Character progression
23. NPC relationships
24. NPC memory
25. Quests
26. World state
27. Monster AI
28. Encounters
29. Rewards
30. Equipment

For every system return:

STATUS:
DEFINED / PARTIALLY DEFINED / MISSING

CURRENT RULE:
What the current Rules Bible actually establishes.

ENGINE STATUS:
IMPLEMENTED / PARTIALLY IMPLEMENTED / NOT VERIFIED

CONFLICTS:
Any conflict between the Rules Bible and the existing direction
of the engine.

PROPOSED RULE:
If the rule is missing or incomplete, propose a precise mechanical
definition.

REQUIRES PLAYER DECISION:
YES / NO

IMPORTANT:

Never silently change an approved rule.

If D&D 2014 or D&D 2024 provides a useful baseline, identify it,
but BLOODLINES custom rules have priority.

Do not treat an implementation suggestion as an approved rule.

At the end provide:

# Critical Decisions

List only decisions that Shadow, the human developer, must approve.

# Rules Bible v0.2 Recommendations

List the exact sections that should be added or clarified.

# Assistant Restrictions

List rules that the other BLOODLINES AI assistants must NOT
assume until explicitly approved.

Return structured Markdown, not JSON.`,
    3000
  );

  console.log(result);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
