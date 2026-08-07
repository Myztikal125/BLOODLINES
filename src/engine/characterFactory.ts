import { loadData } from "./dataLoader";
import { createBaseCharacter } from "./character/character";

export function createCharacter(data: {
  name: string;
  classId: string;
  level?: number;
  bloodlineIds?: string[];
}) {
  const level = data.level ?? 1;

  const classData = loadData("classes", data.classId);

  if (!classData) {
    throw new Error(`Class not found: ${data.classId}`);
  }

  const unlockedProgression =
    classData.progression?.filter(
      (p: any) => p.level <= level
    ) ?? [];

  const featureAbilities =
    (classData.features ?? []).map(
      (f: any) => f.id
    );

  const progressionAbilities =
    unlockedProgression.flatMap(
      (p: any) => p.abilities ?? []
    );

  const abilities = [
    ...new Set([
      ...featureAbilities,
      ...(classData.abilities ?? []),
      ...progressionAbilities
    ])
  ];

  const character = createBaseCharacter({
    name: data.name,
    level,
    class: {
      id: classData.id,
      name: classData.name,
      abilities
    }
  });

  return {
    ...character,

    bloodlineIds: data.bloodlineIds ?? [],

    class: {
      ...classData,

      abilities,

      startingSpells:
        classData.spells?.spellList ?? [],

      signatureSpellSlots:
        classData.id === "wizard"
          ? (level >= 5 ? 3 : level >= 3 ? 2 : 1)
          : 0
    }
  };
}
