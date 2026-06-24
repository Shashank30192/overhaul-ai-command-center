import { NextResponse } from "next/server";
import { getShipmentById } from "@/lib/data";
import { hasApiKey, getAnthropic, MODELS } from "@/lib/ai/anthropic";
import { hasGroqKey, chatGroq, type GroqMessage } from "@/lib/ai/groq";
import {
  RISKGPT_SYSTEM_PROMPT,
  buildShipmentContext,
  getRiskGptMockResponse,
} from "@/lib/mock/riskgpt-responses";

export const runtime = "nodejs";

type HistoryItem = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const body = await request.json();
  const { message, shipmentId, history = [] } = body as {
    message?: string;
    shipmentId?: string;
    history?: HistoryItem[];
  };

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }
  if (!shipmentId) {
    return NextResponse.json({ error: "shipmentId required" }, { status: 400 });
  }

  const shipment = getShipmentById(shipmentId);
  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  const context = buildShipmentContext(shipment);

  // Groq (user-provided key) → Anthropic → mock fallback
  if (hasGroqKey()) {
    try {
      const messages: GroqMessage[] = [
        { role: "system", content: RISKGPT_SYSTEM_PROMPT },
        { role: "system", content: context },
        ...history.slice(-6).map((h) => ({
          role: h.role as "user" | "assistant",
          content: h.content,
        })),
        { role: "user", content: message.trim() },
      ];
      const response = await chatGroq(messages);
      return NextResponse.json({
        response,
        mode: "groq",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("RiskGPT Groq error:", err);
      // fall through to next provider
    }
  }

  if (hasApiKey()) {
    try {
      const anthropic = getAnthropic();
      const response = await anthropic.messages.create({
        model: MODELS.fast,
        max_tokens: 900,
        system: `${RISKGPT_SYSTEM_PROMPT}\n\n${context}`,
        messages: [
          ...history.slice(-6).map((h) => ({
            role: h.role as "user" | "assistant",
            content: h.content,
          })),
          { role: "user", content: message.trim() },
        ],
      });
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      return NextResponse.json({
        response: text,
        mode: "claude",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("RiskGPT Claude error:", err);
    }
  }

  const response = getRiskGptMockResponse(shipment, message);
  return NextResponse.json({
    response,
    mode: "mock",
    timestamp: new Date().toISOString(),
  });
}
