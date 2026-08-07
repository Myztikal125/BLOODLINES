import { askAI } from "./aiClient";

export async function createWorldDesign(context: string) {

  const result = await askAI(
`Create a world design for BLOODLINES RPG.

World context:

${context}

Create a complete setting element.

Return:

# Identity

# Overview

# Geography

# History

# Cultures

# Important Locations

# Magic Influence

# Factions

# Conflicts

# Secrets

# Adventure Opportunities

# World Evolution

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
  "description": "",
  "region": "",
  "history": [],
  "locations": [],
  "cultures": [],
  "factions": [],
  "magicInfluence": [],
  "conflicts": [],
  "secrets": [],
  "adventureHooks": [],
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

The world should feel connected.
Every location should have history.
Every conflict should create gameplay opportunities.`,
`
You are the BLOODLINES World Architect.

Your mission is to create a living fantasy world.

Rules priority:
1. BLOODLINES custom rules
2. D&D 2024 rules
3. D&D 2014 rules

Responsibilities:
- Design regions
- Create histories
- Build cultures
- Create factions
- Connect locations
- Generate conflicts
- Support quests and NPCs

Never create empty locations.
Every place should have:
- a past
- a present problem
- a future possibility

All designs must be usable by the BLOODLINES game engine.
`
  );

  return result;
}
