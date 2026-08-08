import "dotenv/config";
import { BLOODLINES_ASSISTANT_PROTOCOL } from "./assistantProtocol";
import { buildRepositoryContext } from "./repositoryContext";

const DEFAULT_MAX_TOKENS = 1600;
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

function buildMessages(prompt: string, systemPrompt: string) {
  const resolvedSystemPrompt = `${BLOODLINES_ASSISTANT_PROTOCOL}\n\nASSIGNED ASSISTANT ROLE\n\n${systemPrompt}`;
  const repositoryContext = buildRepositoryContext(prompt);

  return [
    { role: "system", content: resolvedSystemPrompt },
    { role: "user", content: `${prompt}\n\n${repositoryContext}` }
  ];
}

async function callGroq(
  key: string,
  messages: Array<{ role: string; content: string }>,
  maxTokens: number
) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: maxTokens,
      messages
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.log("Groq error:");
    console.log(JSON.stringify(data, null, 2));
    throw new Error("Groq request failed");
  }

  return data.choices[0].message.content;
}

async function callOpenRouter(
  key: string,
  messages: Array<{ role: string; content: string }>,
  maxTokens: number
) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      max_tokens: maxTokens,
      messages
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.log("OpenRouter error:");
    console.log(JSON.stringify(data, null, 2));
    throw new Error("OpenRouter request failed");
  }

  return data.choices[0].message.content;
}

export async function askAI(
  prompt: string,
  maxTokensOrSystemPrompt: number | string = DEFAULT_MAX_TOKENS,
  systemPrompt?: string
) {
  const maxTokens =
    typeof maxTokensOrSystemPrompt === "number"
      ? maxTokensOrSystemPrompt
      : DEFAULT_MAX_TOKENS;

  const assistantSystemPrompt =
    systemPrompt ??
    (typeof maxTokensOrSystemPrompt === "string"
      ? maxTokensOrSystemPrompt
      : "You are the BLOODLINES Research Assistant. Provide structured RPG research notes.");

  const messages = buildMessages(prompt, assistantSystemPrompt);
  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (groqKey) {
    try {
      return await callGroq(groqKey, messages, maxTokens);
    } catch (error) {
      console.log("Groq failed; attempting OpenRouter fallback.");
      if (!openRouterKey) throw error;
    }
  }

  if (openRouterKey) {
    return await callOpenRouter(openRouterKey, messages, maxTokens);
  }

  throw new Error("Missing GROQ_API_KEY and OPENROUTER_API_KEY");
}
