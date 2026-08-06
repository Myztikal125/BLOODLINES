import { getAvailableEvolutions } from "./evolutionService";

console.log("Level 1:");
console.log(
  getAvailableEvolutions(
    "shadowveil",
    1,
    0
  )
);

console.log("Level 3:");
console.log(
  getAvailableEvolutions(
    "shadowveil",
    3,
    1
  )
);

console.log("Level 5:");
console.log(
  getAvailableEvolutions(
    "shadowveil",
    5,
    2
  )
);
