import dotenv from "dotenv";
import { BLOODLINES_ASSISTANT_PROTOCOL } from "./assistantProtocol";
import { BLOODLINES_AI_GOVERNANCE } from "./aiGovernance";
import { buildRepositoryContext } from "./repositoryContext";

dotenv.config({ override: true });

const DEFAULT_MAX_TOKENS = 1600;
const GROQ_MODEL = process.env.GROQ_MODEL ?? "groq/compound";
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL ?? "groq/compound-mini";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

interface ProviderBudget { remainingTokens?: number; remainingRequests?: number; resetTokensAt?: number; resetRequestsAt?: number; retryAfterAt?: number; }
const groqBudget: ProviderBudget = {};
const openRouterBudget: ProviderBudget = {};

function buildMessages(prompt: string, systemPrompt: string) {
  const resolvedSystemPrompt = `${BLOODLINES_AI_GOVERNANCE}\n\n${BLOODLINES_ASSISTANT_PROTOCOL}\n\nASSIGNED ASSISTANT ROLE\n\n${systemPrompt}`;
  const repositoryContext = buildRepositoryContext(prompt);
  return [{ role: "system", content: resolvedSystemPrompt }, { role: "user", content: `${prompt}\n\n${repositoryContext}` }];
}
function estimateTokens(messages: Array<{ role: string; content: string }>, maxTokens: number) { return Math.ceil(messages.reduce((total, message) => total + message.content.length, 0) / 4) + maxTokens; }
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
  return Number(match[1] ?? 0) * 3600000 + Number(match[2] ?? 0) * 60000 + Number(match[3] ?? 0) * 1000;
}
function providerCanHandle(budget: ProviderBudget, estimatedTokens: number) {
  const now = Date.now();
  if (budget.retryAfterAt && budget.retryAfterAt > now) return false;
  if (budget.remainingRequests !== undefined && budget.remainingRequests <= 0) return false;
  if (budget.remainingTokens !== undefined && budget.remainingTokens < estimatedTokens) return false;
  return true;
}
function safeProviderError(data: unknown) {
  if (!data || typeof data !== "object") return "unknown provider error";
  const record = data as { error?: { message?: unknown; code?: unknown } };
  const message = typeof record.error?.message === "string" ? record.error.message : "unknown provider error";
  const code = record.error?.code !== undefined ? String(record.error.code) : "unknown";
  return `${code}: ${message}`.slice(0, 500);
}
function getProviderKey(name: "GROQ_API_KEY" | "OPENROUTER_API_KEY") {
  const value = process.env[name]?.trim();
  if (!value) return undefined;
  if (/\s/.test(value) || /^(set|export)\s+/i.test(value)) throw new Error(`${name} is malformed; expected one API key on a single line`);
  return value;
}
async function callGroq(key: string, model: string, messages: Array<{ role: string; content: string }>, maxTokens: number) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, max_tokens: maxTokens, messages }) });
  updateBudget(response.headers, groqBudget);
  const data = await response.json();
  if (!response.ok) throw new Error(`Groq request failed (${response.status}) [${model}]: ${safeProviderError(data)}`);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error(`Groq returned no usable content [${model}]`);
  return content;
}
async function callOpenRouter(key: string, messages: Array<{ role: string; content: string }>, maxTokens: number) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: OPENROUTER_MODEL, max_tokens: maxTokens, messages }) });
  updateBudget(response.headers, openRouterBudget);
  const data = await response.json();
  if (!response.ok) throw new Error(`OpenRouter request failed (${response.status}) [${safeProviderError(data)}]`);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("OpenRouter returned no usable content");
  return content;
}
export async function askAI(prompt: string, maxTokensOrSystemPrompt: number | string = DEFAULT_MAX_TOKENS, systemPrompt?: string) {
  const maxTokens = typeof maxTokensOrSystemPrompt === "number" ? maxTokensOrSystemPrompt : DEFAULT_MAX_TOKENS;
  const assistantSystemPrompt = systemPrompt ?? (typeof maxTokensOrSystemPrompt === "string" ? maxTokensOrSystemPrompt : "You are the BLOODLINES Research Assistant. Provide structured RPG research notes.");
  const messages = buildMessages(prompt, assistantSystemPrompt);
  const estimatedTokens = estimateTokens(messages, maxTokens);
  const failures: string[] = [];
  let groqKey: string | undefined;
  let openRouterKey: string | undefined;
  try { groqKey = getProviderKey("GROQ_API_KEY"); } catch (error) { failures.push(error instanceof Error ? `Groq: ${error.message}` : "Groq: malformed API key"); }
  try { openRouterKey = getProviderKey("OPENROUTER_API_KEY"); } catch (error) { failures.push(error instanceof Error ? `OpenRouter: ${error.message}` : "OpenRouter: malformed API key"); }
  if (groqKey) {
    const groqModels = [GROQ_MODEL, GROQ_FALLBACK_MODEL].filter((model, index, models) => models.indexOf(model) === index);
    for (const model of groqModels) {
      if (!providerCanHandle(groqBudget, estimatedTokens)) { failures.push(`Groq ${model}: unavailable based on known rate limits`); continue; }
      try { return await callGroq(groqKey, model, messages, maxTokens); } catch (error) { failures.push(error instanceof Error ? error.message : `Groq ${model}: unknown error`); }
    }
  } else if (!failures.some((failure) => failure.startsWith("Groq:"))) failures.push("Groq: GROQ_API_KEY is not available to the Node process");
  if (openRouterKey && providerCanHandle(openRouterBudget, estimatedTokens)) {
    try { return await callOpenRouter(openRouterKey, messages, maxTokens); } catch (error) { failures.push(error instanceof Error ? error.message : "OpenRouter: unknown error"); }
  } else if (!openRouterKey && !failures.some((failure) => failure.startsWith("OpenRouter:"))) failures.push("OpenRouter: OPENROUTER_API_KEY is not available to the Node process");
  else if (openRouterKey) failures.push("OpenRouter: unavailable based on known rate limits");
  throw new Error(`No AI provider could handle this request (estimated ${estimatedTokens} tokens).\n${failures.join("\n")}`);
}
