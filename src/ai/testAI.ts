import "dotenv/config";
import { askDungeonMaster } from "./openrouter";

async function testAI() {
  const response = await askDungeonMaster(
    "Describe the opening scene of a dark fantasy adventure in Ashenvale."
  );

  console.log("\nAI TEST RESPONSE:\n");
  console.log(response);
}

testAI();
