export interface BloodlineState {
  bloodlineId: string;
  awakeningLevel: number;
  evolutionPoints: number;
  completedQuests: string[];
  acceptedCurses: string[];
  unlockedEvolutions: string[];
}

export function createBloodlineState(
  bloodlineId: string
): BloodlineState {

  return {
    bloodlineId,
    awakeningLevel: 1,
    evolutionPoints: 0,
    completedQuests: [],
    acceptedCurses: [],
    unlockedEvolutions: []
  };
}

export function addEvolutionPoints(
  state: BloodlineState,
  amount: number
) {
  state.evolutionPoints += amount;
  return state;
}

export function completeQuest(
  state: BloodlineState,
  questId: string
) {
  if (!state.completedQuests.includes(questId)) {
    state.completedQuests.push(questId);
    state.evolutionPoints += 1;
  }

  return state;
}
