import { createCharacter } from "./src/engine/characterFactory";

const wizard = createCharacter({
  name: "Gandalf",
  classId: "wizard",
  level: 1
});

console.log(JSON.stringify(wizard, null, 2));
