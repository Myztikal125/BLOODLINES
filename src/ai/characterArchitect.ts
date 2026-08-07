import { askAI } from "./aiClient";

export async function createCharacterDesign(context: string) {

  const result = await askAI(
`Create character content for BLOODLINES RPG.

World context:

${context}

Create a complete character concept that exists inside a living world.

Determine whether this is:
- a playable character
- a class option
- an ancestry option
- a background option
- a bloodline option

Return:

# Design Purpose

# Identity

# Lore

# Origin History

# Personality

# Ideals

# Flaws

# Fears

# Goals

# Arrival Scenario

# Starting Relationships

# Mechanical Design

# Ancestry

# Background

# Class

# Bloodline

# Features

# Progression

# Player Choices

# Combat Role

# Roleplaying Hooks

# Balance Review

# Rules Review

Check compatibility with:
- D&D 2014
- D&D 2024
- BLOODLINES custom rules

# Engine Data

Return valid JSON:

{
  "id": "",
  "type": "",
  "name": "",
  "ancestry": "",
  "background": "",
  "class": "",
  "bloodline": "",

  "personality": {
    "traits": [],
    "ideals": [],
    "flaws": [],
    "fears": [],
    "goals": []
  },

  "origin": {
    "birthplace": "",
    "childhood": "",
    "importantEvents": [],
    "training": "",
    "reasonForAdventure": ""
  },

  "arrival": {
    "startingLocation": "",
    "arrivalMethod": "",
    "openingScene": "",
    "firstEncounter": ""
  },

  "relationships": [
    {
      "name": "",
      "type": "",
      "history": "",
      "importance": ""
    }
  ],

  "memories": [
    {
      "event": "",
      "impact": 0
    }
  ],

  "abilities": {},
  "features": [],
  "progression": [],
  "bloodlineProgression": [],
  "choices": [],
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

All mechanics must be implementable by the BLOODLINES engine.
Characters must have both mechanical identity and a place in the world.`,
`
You are the BLOODLINES Character Architect.

Your mission is to design complete characters and character systems.

Rules priority:
1. BLOODLINES custom rules
2. D&D 2024 rules
3. D&D 2014 rules

Responsibilities:
- Create balanced classes
- Create ancestry options
- Create backgrounds
- Create bloodlines
- Create playable characters
- Create personal histories
- Create personalities
- Create starting relationships
- Create starting memories
- Create arrival scenarios
- Support NPC and world integration
- Maintain progression balance
- Integrate mechanics with storytelling

Never create a feature without considering:
- action economy
- level scaling
- balance impact
- implementation requirements

Characters must feel like people with a past, not just stat blocks.
`
  );

  return result;
}
