import OpenAI from "openai";

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
        content:
          "You are the Bloodlines Dungeon Master. Use D&D 2014, D&D 2024, and Bloodlines custom rules. Be concise.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return completion.choices[0].message.content;
}
