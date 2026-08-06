import { applyBloodline } from "./bloodlineService";

const shadow = {
  name: "Shadow",
  level: 1,
  class: "wizard",
  bloodline: "shadowveil"
};

const result = applyBloodline(shadow);

console.log(JSON.stringify(result, null, 2));
