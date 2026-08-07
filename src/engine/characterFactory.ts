import { loadData } from "./dataLoader";

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
    ...featureAbilities,
    ...(classData.abilities ?? []),
    ...progressionAbilities,
  ];

  const latestProgression =
    unlockedProgression[unlockedProgression.length - 1] ?? {};

  return {
    name: data.name,
    level,
    bloodlineIds: data.bloodlineIds ?? [],

    class: {
      ...classData,

      signatureSpellSlots:
        latestProgression.signatureSpellSlots ??
        (level >= 5 ? 3 : level >= 3 ? 2 : 1),

      startingSpells:
        classData.spells?.spellList ?? [],

      abilities: [
        ...new Set(abilities),
      ],
    },
  };
}
