import { createBloodlineState } from "./bloodlineState";
import { addEvolutionPoints } from "./bloodlineState";
import { unlockEvolution } from "./evolutionManager";
import { acceptCurse } from "./curseManager";
import { getBloodlineEffects } from "./bloodlineEffects";

const state = createBloodlineState("shadowveil");

addEvolutionPoints(state, 1);

unlockEvolution(
  state,
  3,
  "veil_of_darkness"
);

acceptCurse(
  state,
  "shadow_curse"
);

console.log(
  getBloodlineEffects(state)
);
