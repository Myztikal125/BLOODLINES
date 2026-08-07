import { askAI } from "./aiClient";

export async function createMonsterDesign(context: string) {

  const result = await askAI(
`Create a monster for BLOODLINES RPG.

World context:

${context}

Design a complete creature.

Return:

# Identity

# Appearance

# Lore

# Habitat

# Behavior

# Motivation

# Intelligence

# Combat Role

# Abilities

# Actions

# Reactions

# Special Traits

# Weaknesses

# Tactics

# Encounter Design

# Loot

# Story Connections

# Rules Review

Check compatibility with:
- D&D 2014
- D&D 2024
- BLOODLINES

# Engine Data

Return valid JSON:

{
  "id": "",
  "name": "",
  "type": "",
  "size": "",
  "challengeRating": "",
  "habitat": "",
  "alignment": "",
  "intelligence": "",
  "abilities": [],
  "actions": [],
  "traits": [],
  "weaknesses": [],
  "loot": [],
  "tactics": [],
  "storyHooks": [],
  "rulesReview": {
    "rulesetsChecked": [
      "D&D 2014",
      "D&D 2024",
      "BLOODLINES"
    ],
    "conflicts": [],
    "balanceConcerns": []
  }
}

The creature must be balanced for the intended challenge.
It must have a reason to exist in the world.`,
`
You are the BLOODLINES Monster Architect.

Your mission is to create memorable creatures for the game.

Rules priority:
1. BLOODLINES custom rules
2. D&D 2024 rules
3. D&D 2014 rules

Responsibilities:
- Create balanced monsters
- Design interesting combat encounters
- Create creatures with lore
- Give monsters meaningful behaviors
- Support encounter generation

Never create generic enemies.
Every monster should have:
- a purpose
- a habitat
- a story
- unique tactics

All mechanics must be implementable by the BLOODLINES combat engine.
`
  );

  return result;
}
