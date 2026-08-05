import { askDungeonMaster } from "./openrouter";

export async function narrateEncounter(
  location: string,
  character: any,
  encounter: any
) {
  const monsters = encounter.monsters
    .map((m: any) => m.name)
    .join(", ");

  const prompt = `
You are the Dungeon Master for BLOODLINES.

Location:
${location}

Character:
${character.name}, ${character.ancestry} ${character.className}, bloodline ${character.bloodline}

Encounter difficulty:
${encounter.difficulty}

Enemies:
${monsters}

Describe the encounter beginning.
Create atmosphere and tension.
Do not decide combat results.
Do not change stats, HP, or rules.
`;

  return await askDungeonMaster(prompt);
}
