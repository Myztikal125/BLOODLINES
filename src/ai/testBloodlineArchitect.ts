import fs from "fs";
import { architectData } from "./dataArchitect";

async function main() {

  const rules = fs.readFileSync(
    "docs/BLOODLINE_RULES_v0.1.md",
    "utf8"
  );

  const result = await architectData(`
You are the BLOODLINES Data Architect.

Create final engine-compatible Shadowveil data.

Requirements:
- Match existing loader format.
- Use ids like:
  "shadowveil"
  "wizard"
- Use arrays for:
  powers
  traits
  effects
  interactions

Create ONLY:

data/bloodlines/shadowveil.json
data/bloodlines/evolution_paths.json
data/bloodlines/mutations.json
data/bloodlines/curses.json
data/bloodlines/blessings.json
data/quests/legacy_quests.json

Rules:
- Do not create classes.
- Do not create spells.
- Do not create combat systems.
- Do not invent unsupported stats.
- Use abilities, traits, effects, and progression hooks only.
- Keep Shadowveil compatible with characterFactory.ts.

Include:
- Shadowveil identity
- powers
- awakening
- evolution paths
- curses
- blessings
- wizard class interaction
- legacy quests

Approved Rules:

${rules}
`);

  console.log(result);

}

main();
