import { research } from "./researcher";

async function main() {
  const result = await research(
    "Bloodline system design for BLOODLINES RPG. Research inherited powers, supernatural ancestry, progression systems, awakening mechanics, mutations, curses, blessings, class interactions, and how bloodlines can affect character identity and storytelling."
  );

  console.log(result);
}

main();
