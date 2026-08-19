import { askDungeonMaster } from "./openrouter";
import { SUPERPOWERS_NARRATIVE_SKILLS } from "./skills/superpowers";

export async function narrateEncounter(gameState: {
  location: string;
  character: string;
  encounter: string;
}) {
  const prompt = `
You are the Dungeon Master for BLOODLINES.

${SUPERPOWERS_NARRATIVE_SKILLS}

Current location:
${gameState.location}

Player character:
${gameState.character}

Encounter:
${gameState.encounter}

Describe the scene and present the player with choices.
Stay consistent with D&D 2014, D&D 2024, and Bloodlines rules.
Do not decide dice rolls or combat results. Only narrate.
`;

  return await askDungeonMaster(prompt);
}
