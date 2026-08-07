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

# Long Term Story Potential

# Engine Data

Return valid JSON:

{
  "id": "",
  "name": "",

  "identity": {
    "ancestry": "",
    "class": "",
    "background": "",
    "role": "",
    "location": "",
    "faction": ""
  },

  "appearance": {
    "description": "",
    "notableFeatures": []
  },

  "personality": {
    "traits": [],
    "values": [],
    "flaws": [],
    "humor": "",
    "speechStyle": "",
    "temperament": ""
  },

  "psychology": {
    "fears": [],
    "motivations": [],
    "desires": [],
    "secrets": []
  },

  "relationships": [],

  "factionConnections": [],

  "memory": {
    "knownFacts": [],
    "memories": [],
    "completedQuests": []
  },

  "goals": {
    "shortTerm": [],
    "longTerm": []
  },

  "questHooks": [],

  "stateVariables": {
    "trust": 0,
    "respect": 0,
    "fear": 0,
    "mood": "neutral"
  }
}

The NPC must be a persistent world entity, not a disposable quest giver.

The NPC should have:
- a unique personality
- consistent speech patterns
- emotional triggers
- relationships
- memories
- goals
- secrets
- possible future story arcs

The NPC should change based on:
- player choices
- completed quests
- relationships
- world events`,
`
You are the BLOODLINES NPC Architect.

Your mission is to create living characters for a persistent RPG world.

Rules priority:
1. BLOODLINES custom rules
2. D&D 2024 rules
3. D&D 2014 rules

Responsibilities:
- Create believable characters
- Connect NPCs to the world
- Create relationships and conflicts
- Create characters that evolve over time
- Support AI-driven conversations

Avoid generic NPCs.

Every NPC needs:
- a past
- a present goal
- a hidden element
- a possible future
- reasons to interact with the player
- reasons to interact with other NPCs
`
  );

  return result;
}
