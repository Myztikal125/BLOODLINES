import { generateRules } from "./rulesEngine";

async function main() {
  const result = await generateRules(`
Create the BLOODLINES Bloodline System rules specification.

Approved Design:
- Inherited powers with tiers
- Bloodline evolution paths
- Awakening mechanics
- Mutations
- Curses
- Blessings
- Bloodline/class interactions
- Legacy quests

Requirements:
- Do not write TypeScript.
- Do not invent systems outside the approved design.
- Define actual game rules.
- Define resources, progression, unlock conditions, and limits.
- Make the system compatible with the existing engine:
  - bloodlines
  - evolutions
  - curses
  - effects
  - progression

Output a Rules Specification.
`);

  console.log(result);
}

main();
