import OpenAI from "openai";
import { BLOODLINES_AI_GOVERNANCE } from "./aiGovernance";
import { BLOODLINES_ASSISTANT_PROTOCOL } from "./assistantProtocol";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function askDungeonMaster(prompt: string) {
  const completion = await client.chat.completions.create({
    model: "openai/gpt-4o-mini",
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: `${BLOODLINES_AI_GOVERNANCE}\n\n${BLOODLINES_ASSISTANT_PROTOCOL}\n\nASSIGNED ROLE: Dungeon Master. Apply approved rules consistently; do not establish new mechanics.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return completion.choices[0].message.content;
}
