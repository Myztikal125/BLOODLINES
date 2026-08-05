import "dotenv/config";
import { narrateEncounter } from "./dungeonMaster";

async function testDM() {
  const result = await narrateEncounter({
    location: "Ashenvale",
    character: "Shadow, level 1 elf wizard with Shadowveil bloodline",
    encounter: "A group of goblins emerges from the forest shadows",
  });

  console.log(result);
}

testDM();
