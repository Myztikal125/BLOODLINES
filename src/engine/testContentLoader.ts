import { loadContent } from "./contentLoader";

const npcs = loadContent("npcs");

console.log(
  "Loaded NPCs:",
  npcs.length
);

console.log(npcs);
