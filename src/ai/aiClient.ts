import "dotenv/config";
import { BLOODLINES_ASSISTANT_PROTOCOL } from "./assistantProtocol";
import { buildRepositoryContext } from "./repositoryContext";

const DEFAULT_MAX_TOKENS = 1600;
const GROQ_MODEL = process.env.GROQ_MODEL ?? "groq/compound";
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL ?? "groq/compound-mini";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

interface ProviderBudget {
  remainingTokens?: number;
  remainingRequests?: number;
  resetTokensAt?: number;
  resetRequestsAt?: number;
  retryAfterAt?: number;
}

const groqBudget: ProviderBudget = {};
const openRouterBudget: ProviderBudget = {};

function buildMessages(prompt: string, systemPrompt: string) {
  const resolvedSystemPrompt = `${BLOODLINES_ASSISTANT_PROTOCOL}\n\nASSIGNED ASSISTANT ROLE\n\n${systemPrompt}`;
  const repositoryContext = buildRepositoryContext(prompt);

  return [
    { role: "system", content: resolvedSystemPrompt },
    { role: "user", content: `${prompt}\n\n${repositoryContext}` }
  ];
}

function estimateTokens(messages: Array<{ role: string; content: string }>, maxTokens: number) {
  const inputCharacters = messages.reduce((total, message) => total + message.content.length, 0);
  // Conservative approximation used only for provider selection; the provider remains authoritative.
  return Math.ceil(inputCharacters / 4) + maxTokens;
}

function updateBudget(headers: Headers, budget: ProviderBudget) {
  const remainingTokens = Number(headers.get("x-ratelimit-remaining-tokens"));
  const remainingRequests = Number(headers.get("x-ratelimit-remaining-requests"));

  if (Number.isFinite(remainingTokens)) budget.remainingTokens = remainingTokens;
  if (Number.isFinite(remainingRequests)) budget.remainingRequests = remainingRequests;

  const retryAfter = Number(headers.get("retry-after"));
  if (Number.isFinite(retryAfter)) budget.retryAfterAt = Date.now() + retryAfter * 1000;

  const tokenReset = headers.get("x-ratelimit-reset-tokens");
  const requestReset = headers.get("x-ratelimit-reset-requests");

  if (tokenReset) budget.resetTokensAt = Date.now() + parseDurationMs(tokenReset);
  if (requestReset) budget.resetRequestsAt = Date.now() + parseDurationMs(requestReset);
}

function parseDurationMs(value: string) {
  const match = value.match(/(?:(\d+(?:\.\d+)?)h)?\s*(?:(\d+(?:\.\d+)?)m)?\s*(?:(\d+(?:\.\d+)?)s)?/i);
  if (!match) return 0;

  return (
    Number(match[1] ?? 0) * 60 * 60 * 1000 +
    Number(match[2] ?? 0) * 60 * 1000 +
    Number(match[3] ?? 0) * 1000
  );
}

function providerCanHandle(budget: ProviderBudget, estimatedTokens: number) {
  const now = Date.now();

  if (budget.retryAfterAt && budget.retryAfterAt > now) return false;
  if (budget.remainingRequests !== undefined && budget.remainingRequests <= 0) return false;
  if (budget.remainingTokens !== undefined && budget.remainingTokens < estimatedTokens) return false;

  return true;
}

async function callGroq(
  key: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  maxTokens: number
) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages })
  });

  updateBudget(response.headers, groqBudget);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Groq request failed (${response.status})`);
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
    body: JSON.stringify({ model: OPENROUTER_MODEL, max_tokens: maxTokens, messages })
  });

  updateBudget(response.headers, openRouterBudget);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`OpenRouter request failed (${response.status})`);
  }

  return data.choices[0].message.content;
}

export async function askAI(
  prompt: string,
  maxTokensOrSystemPrompt: number | string = DEFAULT_MAX_TOKENS,
  systemPrompt?: string
) {
  const maxTokens = typeof maxTokensOrSystemPrompt === "number" ? maxTokensOrSystemPrompt : DEFAULT_MAX_TOKENS;
  const assistantSystemPrompt =
    systemPrompt ??
    (typeof maxTokensOrSystemPrompt === "string"
      ? maxTokensOrSystemPrompt
      : "You are the BLOODLINES Research Assistant. Provide structured RPG research notes.");

  const messages = buildMessages(prompt, assistantSystemPrompt);
  const estimatedTokens = estimateTokens(messages, maxTokens);
  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (groqKey) {
    const groqModels = [GROQ_MODEL, GROQ_FALLBACK_MODEL].filter(
      (model, index, models) => models.indexOf(model) === index
    );

    for (const model of groqModels) {
      if (!providerCanHandle(groqBudget, estimatedTokens)) break;

      try {
        return await callGroq(groqKey, model, messages, maxTokens);
      } catch {
        // Try the next capable provider/model without exposing provider internals to assistants.
      }
    }
  }

  if (openRouterKey && providerCanHandle(openRouterBudget, estimatedTokens)) {
    return await callOpenRouter(openRouterKey, messages, maxTokens);
  }

  if (groqKey && providerCanHandle(groqBudget, estimatedTokens)) {
    return await callGroq(groqKey, GROQ_FALLBACK_MODEL, messages, maxTokens);
  }

  throw new Error(
    `No AI provider currently has sufficient capacity for this request (estimated ${estimatedTokens} tokens).`
  );
}
