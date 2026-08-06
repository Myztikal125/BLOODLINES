import { createCharacter } from "../engine/characterFactory";
import { applyBloodlines } from "./bloodlineService";

const shadow = createCharacter({
  name: "Shadow",
  classId: "wizard",
  bloodlineIds: ["shadowveil"]
});

const updated = applyBloodlines(shadow);

console.log(JSON.stringify(updated, null, 2));
