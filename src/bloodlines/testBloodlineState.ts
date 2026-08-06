import {
  createBloodlineState,
  completeQuest
} from "./bloodlineState";

let state = createBloodlineState(
  "shadowveil"
);

console.log("Starting:");
console.log(state);

state = completeQuest(
  state,
  "whisper_in_the_dark"
);

console.log("After quest:");
console.log(state);
