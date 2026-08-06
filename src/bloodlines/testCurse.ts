import { createBloodlineState } from "./bloodlineState";
import { acceptCurse } from "./curseManager";

const state = createBloodlineState("shadowveil");

acceptCurse(
  state,
  "shadow_curse"
);

console.log(state);
