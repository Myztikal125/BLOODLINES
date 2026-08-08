import "dotenv/config";
import { BLOODLINES_ASSISTANT_PROTOCOL } from "./assistantProtocol";
import { buildRepositoryContext } from "./repositoryContext";

export async function askAI(
  prompt: string,
  maxTokensOrSystemPrompt: number | string = 2000,
  systemPrompt?: string
) {
  const key = process.env.OPENROUTER_API_KEY;

  if (!key) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const maxTokens =
    typeof maxTokensOrSystemPrompt === "number"
      ? maxTokensOrSystemPrompt
      : 2000;

  const assistantSystemPrompt =
    systemPrompt ??
    (
      typeof maxTokensOrSystemPrompt === "string"
        ? maxTokensOrSystemPrompt
        : "You are the BLOODLINES Research Assistant. Provide structured RPG research notes."
    );

  const resolvedSystemPrompt = `${BLOODLINES_ASSISTANT_PROTOCOL}\n\nASSIGNED ASSISTANT ROLE\n\n${assistantSystemPrompt}`;
  const repositoryContext = buildRepositoryContext(prompt);

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
            content: resolvedSystemPrompt
          },
          {
            role: "user",
            content: `${prompt}\n\n${repositoryContext}`
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
