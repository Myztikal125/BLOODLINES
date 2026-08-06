import { loadBloodline } from "./bloodlineLoader";
import { BloodlineState } from "./bloodlineState";

export function unlockEvolution(
  state: BloodlineState,
  level: number,
  evolutionId: string
) {
  const bloodline = loadBloodline(state.bloodlineId);

  const evolution = bloodline.evolutions.find(
    (e: any) => e.id === evolutionId
  );

  if (!evolution) {
    throw new Error(`Evolution not found: ${evolutionId}`);
  }

  if (level < evolution.unlock.level) {
    throw new Error(
      `Level ${level} required for ${evolution.name}`
    );
  }

  if (state.evolutionPoints < 1) {
    throw new Error(
      "Not enough evolution points"
    );
  }

  if (
    state.unlockedEvolutions.includes(evolutionId)
  ) {
    return state;
  }

  state.evolutionPoints -= 1;
  state.unlockedEvolutions.push(evolutionId);

  return state;
}
