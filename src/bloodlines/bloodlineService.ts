import { loadBloodline } from "./bloodlineLoader";

export function applyBloodlines(character: any) {
  if (!character.bloodlines) {
    return character;
  }

  return {
    ...character,
    bloodlines: character.bloodlines.map((entry: any) => {
      const bloodline = loadBloodline(entry.id);

      return {
        ...entry,

        traits: bloodline.traits ?? [],

        evolutions: (bloodline.evolutions ?? []).filter(
          (evolution: any) =>
            character.level >= evolution.unlock.level
        ),

        curses: bloodline.curses ?? [],

        legacyQuests: bloodline.legacy_quests ?? []
      };
    })
  };
}

export const applyBloodline = applyBloodlines;
