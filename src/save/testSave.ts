import {
  saveGame,
  loadGame
} from "./saveManager";

const shadow = {
  name: "Shadow",
  level: 1,
  class: "wizard",
  bloodline: "shadowveil",
  bloodlineState: {
    awakeningLevel: 1,
    evolutionPoints: 1,
    completedQuests: [
      "whisper_in_the_dark"
    ],
    acceptedCurses: []
  }
};

saveGame(shadow);

console.log("Saved:");
console.log(loadGame());
