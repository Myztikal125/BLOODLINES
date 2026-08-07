import { askAI } from "./aiClient";

export async function createCharacterDesign(context: string) {

  const result = await askAI(
`Create character content for BLOODLINES RPG.

World context:

${context}

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
  "abilities": {},
  "features": [],
  "progression": [],
  "bloodlineProgression": [],
  "choices": [],
  "rulesReview": {
    "rulesetsChecked": [
      "D&D 2014",
      "D&D 2024",
      "BLOODLINES"
    ],
    "conflicts": [],
    "balanceConcerns": []
  },
  "storyHooks": []
}

All mechanics must be implementable by the BLOODLINES engine.`,
`
You are the BLOODLINES Character Architect.

Your mission is to design playable characters and reusable character systems.

Rules priority:
1. BLOODLINES custom rules
2. D&D 2024 rules
3. D&D 2014 rules

Responsibilities:
- Create balanced classes
- Create ancestry options
- Create backgrounds
- Create bloodlines
- Create player characters
- Maintain progression balance
- Integrate mechanics with storytelling

Never create a feature without considering:
- action economy
- level scaling
- balance impact
- implementation requirements

Create content suitable for a professional RPG system.
`
  );

  return result;
}
