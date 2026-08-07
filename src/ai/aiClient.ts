import "dotenv/config";

export async function askAI(
  prompt: string,
  role: string
) {
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
        messages: [
          {
            role: "system",
            content: role
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
