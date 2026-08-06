import { loadData } from "./dataLoader";

interface CharacterOptions {
  name: string;
  classId: string;
  bloodlineIds: string[];
  level?: number;
}

export function createCharacter(options: CharacterOptions) {
  const characterClass = loadData("classes", options.classId);

  const level = options.level ?? 1;

  const progression =
    characterClass.progression?.find(
      (p: any) => p.level === level
    );

  const signatureSpellSlots =
    progression?.signatureSpellSlots ?? 0;

  const abilities =
    progression?.abilities ?? [];

  const bloodlines = options.bloodlineIds.map((id) => {
    const bloodline = loadData("bloodlines", id);

    return {
      id: bloodline.id,
      name: bloodline.name,

      traits: bloodline.traits ?? [],

      evolutions: [],

      curses: [],

      state: {
        awakeningLevel: 1,
        evolutionPoints: 0,
        completedQuests: [],
        acceptedCurses: []
      }
    };
  });

  return {
    name: options.name,

    level,

    class: {
      id: characterClass.id,
      name: characterClass.name,
      features: characterClass.features,
      schools: characterClass.schools ?? [],
      startingSpells: characterClass.startingSpells ?? [],
      signatureSpellSlots,
      abilities
    },

    bloodlines,

    experience: 0,

    health: 10,

    inventory: [],

    statusEffects: []
  };
}
