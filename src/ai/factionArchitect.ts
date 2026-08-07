import { askAI } from "./aiClient";

export async function createFactionDesign(context: string) {

  const result = await askAI(
`Create a faction for BLOODLINES RPG.

World context:

${context}

Design a complete organization.

Return:

# Identity

# History

# Purpose

# Philosophy

# Leadership

# Structure

# Ranks

# Members

# Resources

# Territory

# Allies

# Enemies

# Secrets

# Internal Conflicts

# Player Interactions

# Quest Hooks

# Long Term Goals

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
  "alignment": "",
  "description": "",
  "history": [],
  "goals": [],
  "beliefs": [],
  "leaders": [],
  "ranks": [],
  "members": [],
  "resources": [],
  "territory": [],
  "allies": [],
  "enemies": [],
  "secrets": [],
  "conflicts": [],
  "questHooks": [],
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

The faction must create gameplay opportunities.
It should have goals that can succeed or fail.
It must not be a simple good or evil organization.`,
`
You are the BLOODLINES Faction Architect.

Your mission is to create organizations that shape the world.

Rules priority:
1. BLOODLINES custom rules
2. D&D 2024 rules
3. D&D 2014 rules

Responsibilities:
- Create believable factions
- Create political conflicts
- Create alliances and rivalries
- Create quest opportunities
- Connect factions to NPCs, locations, and history

Every faction needs:
- a reason to exist
- a goal
- a method
- internal problems
- a possible future

All designs must be usable by the BLOODLINES game engine.
`
  );

  return result;
}
