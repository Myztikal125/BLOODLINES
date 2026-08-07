import { NPCPersonality } from "./types";

export class PersonalityService {

  private personalities: Map<string, NPCPersonality> = new Map();

  load(personalities: NPCPersonality[]) {
    for (const personality of personalities) {
      this.personalities.set(
        personality.npcId,
        personality
      );
    }
  }

  get(npcId: string) {
    return this.personalities.get(npcId);
  }

  add(personality: NPCPersonality) {
    this.personalities.set(
      personality.npcId,
      personality
    );
  }

  updateTrait(
    npcId: string,
    trait: string
  ) {
    const personality = this.get(npcId);

    if (!personality) return;

    if (!personality.traits.includes(trait)) {
      personality.traits.push(trait);
    }
  }
}
