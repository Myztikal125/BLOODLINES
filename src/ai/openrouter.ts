import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function askDungeonMaster(prompt: string) {
  const completion = await client.chat.completions.create({
    model: "openai/gpt-4o",
    max_tokens: 1000,
    messages: [
      {
        role: "system",
        content:
          "You are the Bloodlines Dungeon Master. Use D&D 2014, D&D 2024, and Bloodlines custom rules.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return completion.choices[0].message.content;
}
