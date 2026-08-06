import { loadBloodline } from "./bloodlineLoader";
import { BloodlineState } from "./bloodlineState";

export function acceptCurse(
  state: BloodlineState,
  curseId: string
) {
  const bloodline = loadBloodline(state.bloodlineId);

  const curse = bloodline.curses.find(
    (c: any) => c.id === curseId
  );

  if (!curse) {
    throw new Error(`Curse not found: ${curseId}`);
  }

  if (!state.acceptedCurses.includes(curseId)) {
    state.acceptedCurses.push(curseId);
  }

  return state;
}
