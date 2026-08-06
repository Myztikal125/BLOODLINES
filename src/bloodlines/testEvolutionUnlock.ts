import { createBloodlineState } from "./bloodlineState";
import { addEvolutionPoints } from "./bloodlineState";
import { unlockEvolution } from "./evolutionManager";

const state = createBloodlineState("shadowveil");

addEvolutionPoints(state, 1);

unlockEvolution(
  state,
  3,
  "veil_of_darkness"
);

console.log(state);
