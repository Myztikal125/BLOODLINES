import "dotenv/config";

export async function askAI(prompt: string, maxTokens: number = 2000) {
  const key = process.env.OPENROUTER_API_KEY;

  if (!key) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        max_tokens: maxTokens,
        messages: [
          {
            role: "system",
            content:
              "You are the BLOODLINES Research Assistant. Provide structured RPG research notes."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.log("OpenRouter error:");
    console.log(JSON.stringify(data, null, 2));
    throw new Error("OpenRouter request failed");
  }

  return data.choices[0].message.content;
}
