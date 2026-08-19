import { AbilityDefinition, CombinationState, CombinationTag, CombinationUnlock } from "./types";

export interface CombinationCharacterInput {
  level: number;
  classes: string[];
  bloodlines: string[];
  tags: CombinationTag[];
  unlockedAbilities?: string[];
}

export class CombinationEngine {
  constructor(
    private readonly combinations: CombinationUnlock[],
    private readonly abilities: AbilityDefinition[]
  ) {}

  evaluate(character: CombinationCharacterInput): CombinationState {
    const unlocked = new Set(character.unlockedAbilities ?? []);
    const available: string[] = [];
    const locked: string[] = [];

    for (const combination of this.combinations) {
      if (this.matches(character, combination) && this.dependenciesMet(combination, unlocked)) {
        if (combination.unlocks.every(id => unlocked.has(id))) {
          unlocked.add(combination.id);
        } else {
          available.push(combination.id);
        }
      } else {
        locked.push(combination.id);
      }
    }

    return { unlocked: [...unlocked], available, locked };
  }

  getAbility(id: string): AbilityDefinition | undefined {
    return this.abilities.find(ability => ability.id === id);
  }

  private matches(character: CombinationCharacterInput, combination: CombinationUnlock): boolean {
    const req = combination.requirements;
    if (req.minLevel !== undefined && character.level < req.minLevel) return false;
    if (req.classes?.length && !req.classes.some(cls => character.classes.includes(cls))) return false;
    if (req.bloodlines?.length && !req.bloodlines.some(bl => character.bloodlines.includes(bl))) return false;
    return req.tags.every(tag => character.tags.includes(tag));
  }

  private dependenciesMet(combination: CombinationUnlock, unlocked: Set<string>): boolean {
    return (combination.requirements.requires ?? []).every(id => unlocked.has(id));
  }
}
