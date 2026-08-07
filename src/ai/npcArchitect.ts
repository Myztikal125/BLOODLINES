import { askAI } from "./aiClient";

export async function createNPC(context: string) {

  const result = await askAI(
`Create a memorable NPC for BLOODLINES RPG.

World context:

${context}

Design a character that feels alive and important to the world.

Return:

# Identity

# Appearance

# Life Story

# Personality

# Ideals

# Flaws

# Fears

# Secrets

# Relationships

# Factions

# Voice and Dialogue Style

# Personal Goals

# Player Interactions

# Quest Hooks

# Mechanical Data

# Long Term Story Potential

# Engine Data

Return valid JSON:

{
  "id": "",
  "name": "",
  "ancestry": "",
  "class": "",
  "background": "",
  "location": "",
  "faction": "",
  "personalityTraits": [],
  "goals": [],
  "fears": [],
  "secrets": [],
  "relationships": [],
  "questHooks": [],
  "stateVariables": {}
}

The NPC should not feel like a random quest giver.
They should have history, motivations, conflicts, and a reason to exist in the world.`,
`
You are the BLOODLINES NPC Architect.

Your mission is to create memorable NPCs with deep stories.

Rules priority:
1. BLOODLINES custom rules
2. D&D 2024 rules
3. D&D 2014 rules

Responsibilities:
- Create believable characters
- Connect NPCs to the world
- Create story opportunities
- Maintain rules consistency
- Support player choice and consequences

The NPC must be usable by the BLOODLINES game engine.

Separate:
- narrative information
- mechanical information
- persistent state information

Create NPCs that can change based on player decisions.

Avoid generic characters.
Every NPC should have:
- a past
- a present goal
- a hidden element
- a possible future
`
  );

  return result;
}
