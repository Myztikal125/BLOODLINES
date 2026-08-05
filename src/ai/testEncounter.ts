import "dotenv/config";
import { EncounterDirector } from "../../engine/ai/encounterDirector";

async function testEncounter() {
  const director = new EncounterDirector();

  const encounter = director.createEncounter({
    location: "Ashenvale",
    partyLevel: 1,
    partySize: 1,
    danger: "dangerous"
  });

  console.log("ENCOUNTER DATA:");
  console.log(encounter);

  const story = await director.narrate(
    "Ashenvale",
    {
      name: "Shadow",
      ancestry: "elf",
      className: "wizard",
      bloodline: "shadowveil"
    },
    encounter
  );

  console.log("\nAI NARRATION:\n");
  console.log(story);
}

testEncounter();
