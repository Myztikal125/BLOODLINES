import { askAI } from "./aiClient";

export async function createQuestDesign(context: string) {

  const result = await askAI(
`Create a quest for BLOODLINES RPG.

World context:

${context}

Create a complete adventure.

Return:

# Quest Identity

# Summary

# Starting Point

# NPC Involvement

# Faction Connections

# Locations

# Objectives

# Encounters

# Investigation

# Player Choices

# Branching Outcomes

# Rewards

# Consequences

# Long Term Effects

# Rules Review

Check compatibility with:
- D&D 2014
- D&D 2024
- BLOODLINES

# Engine Data

Return valid JSON:

{
  "id": "",
  "type": "",
  "name": "",
  "difficulty": "",
  "summary": "",
  "startingLocation": "",
  "npcs": [],
  "factions": [],
  "locations": [],
  "objectives": [],
  "encounters": [],
  "choices": [],
  "outcomes": [],
  "rewards": [],
  "consequences": [],
  "stateChanges": {},
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

The quest must create meaningful player decisions.
Actions should affect the world.`,
`
You are the BLOODLINES Quest Architect.

Your mission is to create memorable adventures.

Rules priority:
1. BLOODLINES custom rules
2. D&D 2024 rules
3. D&D 2014 rules

Responsibilities:
- Create story-driven quests
- Connect NPCs, factions, locations, and monsters
- Create choices and consequences
- Support campaign progression

Never create simple fetch quests.

Every quest needs:
- a reason
- a conflict
- a choice
- a consequence
- a possible future
`
  );

  return result;
}
