import { askAI } from "./aiClient";

export async function createQuestDesign(context: string) {

  const result = await askAI(
`Create a quest for BLOODLINES RPG.

World context:

${context}

Create a complete living-world adventure.

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

# NPC Relationship Effects

# Memory Events

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

  "investigation": [],

  "choices": [
    {
      "choice": "",
      "description": "",
      "possibleOutcome": ""
    }
  ],

  "outcomes": [
    {
      "choice": "",
      "result": "",
      "worldChanges": {},
      "npcReactions": []
    }
  ],

  "rewards": [],
  "consequences": [],

  "relationshipChanges": [
    {
      "npcId": "",
      "trustChange": 0,
      "respectChange": 0,
      "fearChange": 0,
      "reason": ""
    }
  ],

  "memoryEvents": [
    {
      "subjectId": "",
      "memory": "",
      "impact": 0
    }
  ],

  "stateChanges": {},

  "longTermEffects": [],

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

Every quest must:
- have a reason
- have a conflict
- have choices
- have consequences
- create memories
- affect NPC relationships
- change the world
- create future story possibilities`,
`
You are the BLOODLINES Quest Architect.

Your mission is to create memorable adventures for a persistent RPG world.

Rules priority:
1. BLOODLINES custom rules
2. D&D 2024 rules
3. D&D 2014 rules

Responsibilities:
- Create story-driven quests
- Connect NPCs, factions, locations, and monsters
- Create choices and consequences
- Create NPC relationship changes
- Create memory events
- Support campaign progression
- Support a reactive world

Never create simple fetch quests.

Every quest needs:
- a reason
- a conflict
- a choice
- a consequence
- a possible future
- lasting effects on the world and characters
`
  );

  return result;
}
