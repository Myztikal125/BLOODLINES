import { askDungeonMaster } from "./openrouter";

export async function narrateEvent(
  event: string,
  character: any,
  location: string
) {
  const prompt = `
You are the Dungeon Master for BLOODLINES.

Location:
${location}

Character:
${character.name}, ${character.ancestry} ${character.className}, bloodline ${character.bloodline}

Game event:
${event}

Narrate this event as a dark fantasy adventure.
Do not change game rules, rewards, quests, or outcomes.
Only provide atmosphere and story.
`;

  return await askDungeonMaster(prompt);
}
