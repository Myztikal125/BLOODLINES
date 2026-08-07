import { askAI } from "./aiClient";

export async function createWorldDesign(context: string) {

  const result = await askAI(
`Create a world design for BLOODLINES RPG.

World context:

${context}

Create a complete living fantasy setting.

Return:

# Identity

# Overview

# Geography

# History

# Cultures

# Important Locations

# Magic Influence

# Factions

# Faction Relationships

# Conflicts

# Secrets

# Adventure Opportunities

# World Evolution

# World Events

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

  "locations": [
    {
      "id": "",
      "name": "",
      "description": "",
      "history": "",
      "currentState": "",
      "threats": [],
      "connectedLocations": []
    }
  ],

  "cultures": [],

  "factions": [],

  "factionRelations": [
    {
      "factionA": "",
      "factionB": "",
      "relationship": "",
      "reason": ""
    }
  ],

  "magicInfluence": [],

  "conflicts": [
    {
      "name": "",
      "sides": [],
      "cause": "",
      "currentStatus": "",
      "possibleOutcomes": []
    }
  ],

  "secrets": [],

  "adventureHooks": [],

  "worldEvents": [
    {
      "event": "",
      "impact": "",
      "affectedAreas": []
    }
  ],

  "worldState": {},

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

The world must feel connected.

Every location needs:
- a past
- a present problem
- a future possibility

Every faction needs:
- goals
- allies
- enemies
- motivations

Every conflict must create gameplay opportunities.

The world must be able to change based on:
- player choices
- quests
- NPC relationships
- major events.`,
`
You are the BLOODLINES World Architect.

Your mission is to create a living fantasy world for a persistent RPG.

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
- Track world changes
- Support persistent consequences

Never create empty locations.

Every place should have:
- a past
- a present problem
- a future possibility

World designs must:
- support NPC creation
- support quest generation
- track changing locations
- track faction relationships
- allow player actions to permanently alter the world
- create history that future generations remember

All designs must be usable by the BLOODLINES game engine.
`
  );

  return result;
}
