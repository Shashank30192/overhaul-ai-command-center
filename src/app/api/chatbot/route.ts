import { NextResponse } from "next/server";
import { hasGroqKey, chatGroq } from "@/lib/ai/groq";
import { getChatbotResponse } from "@/lib/mock/agent-mock";

export const runtime = "nodejs";

type HistoryItem = { role: "user" | "assistant"; content: string };

const SYSTEM = `You are RiskBot, an expert supply chain risk assistant for Overhaul — a cargo security and visibility platform. You help GSOC officers, operations managers, and logistics teams understand supply chain risks, cargo theft patterns, carrier compliance, cold chain monitoring, GPS tracking anomalies, and freight security best practices.

Be concise and specific. Use bullet points for lists. When asked about Overhaul features, explain them as a knowledgeable product expert. Always respond as if you have deep domain expertise in cargo security and freight logistics.`;

export async function POST(request: Request) {
  const body = await request.json() as { message?: string; history?: HistoryItem[] };
  const { message, history = [] } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  if (hasGroqKey()) {
    try {
      const response = await chatGroq([
        { role: "system", content: SYSTEM },
        ...history.slice(-8).map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
        { role: "user", content: message.trim() },
      ]);
      return NextResponse.json({ response, mode: "groq" });
    } catch (err) {
      console.error("Chatbot Groq error:", err);
    }
  }

  return NextResponse.json({ response: getChatbotResponse(message), mode: "mock" });
}
