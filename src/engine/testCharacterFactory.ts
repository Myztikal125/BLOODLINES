import { createCharacter } from "./characterFactory";

const shadow = createCharacter({
  name: "Shadow",
  classId: "wizard",
  bloodlineIds: ["shadowveil"]
});

console.log(JSON.stringify(shadow, null, 2));
