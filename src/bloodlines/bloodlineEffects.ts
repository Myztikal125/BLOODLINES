import { loadBloodline } from "./bloodlineLoader";
import { BloodlineState } from "./bloodlineState";

export function getBloodlineEffects(
  state: BloodlineState
) {
  const bloodline = loadBloodline(
    state.bloodlineId
  );

  const effects: any[] = [];

  // Unlocked evolutions
  for (const evolutionId of state.unlockedEvolutions) {
    const evolution = bloodline.evolutions.find(
      (e: any) => e.id === evolutionId
    );

    if (evolution) {
      effects.push({
        source: evolution.id,
        type: "ability",
        name: evolution.name,
        description: evolution.description
      });
    }
  }

  // Accepted curses
  for (const curseId of state.acceptedCurses) {
    const curse = bloodline.curses.find(
      (c: any) => c.id === curseId
    );

    if (curse) {
      effects.push({
        source: curse.id,
        type: "curse",
        name: curse.name,
        description: curse.description
      });
    }
  }

  return effects;
}
