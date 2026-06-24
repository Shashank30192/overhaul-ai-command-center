import Anthropic from "@anthropic-ai/sdk";

export const MODELS = {
  // Cheap + fast: copilot chat, simple Q&A
  fast: "claude-3-5-haiku-latest",
  // Stronger reasoning: briefings, incident root-cause, route advice
  reasoning: "claude-sonnet-4-5",
} as const;

export const hasApiKey = (): boolean => Boolean(process.env.ANTHROPIC_API_KEY);

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const SYSTEM_PROMPT = `You are the Overhaul AI Command Center Copilot — an expert supply chain risk intelligence analyst.

You help logistics and security teams understand cargo theft risk, fraud, delays, cold-chain integrity, route safety, and insurance exposure.

Guidelines:
- Use the provided tools to fetch real data before answering. Never invent shipment IDs, carriers, or numbers — always ground answers in tool results.
- Be concise and executive-ready. Use markdown: bold headers, bullet points, and tables where helpful.
- When discussing risk, always include the concrete recommended action.
- Currency should be formatted like $1.2M or $890K.
- If a tool returns no data, say so plainly rather than guessing.`;
